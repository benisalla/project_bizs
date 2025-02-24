import React, { useRef, useState, useEffect, use } from "react";
import * as d3 from "d3";
import * as tf from "@tensorflow/tfjs";
import regression from "regression";
import "./Prediction.css";


const Prediction = ({ countryName, data }) => {
    const svgRef = useRef();
    const lossSvgRef = useRef();
    const accuracySvgRef = useRef(); // NEW: for accuracy plot
    const [errors, setErrors] = useState({ stdErrorLSTM: null });
    const [training, setTraining] = useState(false);
    const [trainingLossData, setTrainingLossData] = useState([]);
    const [trainingAccuracyData, setTrainingAccuracyData] = useState([]); // NEW: accuracy state
    const [waterType, setWaterType] = useState("usage");

    // LOSS PLOT (existing) remains, and now we add an ACCURACY PLOT effect.
    useEffect(() => {
        if (training && lossSvgRef.current && trainingLossData.length) {
            const svg = d3.select(lossSvgRef.current);
            svg.selectAll("*").remove();
            const margin = { top: 20, right: 20, bottom: 30, left: 40 };
            const width = 800 - margin.left - margin.right;
            const height = 200 - margin.top - margin.bottom;
            const g = svg
                .attr("width", width + margin.left + margin.right)
                .attr("height", height + margin.top + margin.bottom)
                .append("g")
                .attr("transform", `translate(${margin.left},${margin.top})`);

            const x = d3.scaleLinear().domain([0, d3.max(trainingLossData, d => d.epoch)]).range([0, width]);
            const y = d3.scaleLinear().domain([0, d3.max(trainingLossData, d => d.loss)]).range([height, 0]);

            g.append("g").attr("transform", `translate(0,${height})`).call(d3.axisBottom(x).ticks(5));
            g.append("g").call(d3.axisLeft(y).ticks(5));

            const line = d3.line().x(d => x(d.epoch)).y(d => y(d.loss));
            g.append("path").datum(trainingLossData).attr("fill", "none").attr("stroke", "steelblue")
                .attr("stroke-width", 2).attr("d", line);
        }
    }, [trainingLossData, training]);

    // NEW: Accuracy plot effect (similar to loss plot)
    useEffect(() => {
        if (training && accuracySvgRef.current && trainingAccuracyData.length) {
            const svg = d3.select(accuracySvgRef.current);
            svg.selectAll("*").remove();
            const margin = { top: 20, right: 20, bottom: 30, left: 40 };
            const width = 800 - margin.left - margin.right;
            const height = 200 - margin.top - margin.bottom;
            const g = svg
                .attr("width", width + margin.left + margin.right)
                .attr("height", height + margin.top + margin.bottom)
                .append("g")
                .attr("transform", `translate(${margin.left},${margin.top})`);

            const x = d3.scaleLinear().domain([0, d3.max(trainingAccuracyData, d => d.epoch)]).range([0, width]);
            const y = d3.scaleLinear().domain([0, d3.max(trainingAccuracyData, d => d.accuracy)]).range([height, 0]);

            g.append("g").attr("transform", `translate(0,${height})`).call(d3.axisBottom(x).ticks(5));
            g.append("g").call(d3.axisLeft(y).ticks(5));

            const line = d3.line().x(d => x(d.epoch)).y(d => y(d.accuracy));
            g.append("path").datum(trainingAccuracyData).attr("fill", "none").attr("stroke", "green")
                .attr("stroke-width", 2).attr("d", line);
        }
    }, [trainingAccuracyData, training]);

    // Separate function to draw historical data.
    const drawHistoricalData = (combinedData) => { // UPDATED: now takes combined historical + forecast data
        const svgEl = d3.select(svgRef.current);
        // Clear previous groups.
        svgEl.selectAll("*").remove();
        if (!svgRef.current._dimensions) {
            const containerElement = svgRef.current.parentNode;
            const containerWidth = containerElement.clientWidth || 350;
            const containerHeight = containerElement.clientHeight || 250;
            const margin = { top: 20, right: 20, bottom: 30, left: 40 };
            svgRef.current._dimensions = {
                containerWidth,
                containerHeight,
                margin,
                width: containerWidth - margin.left - margin.right,
                height: containerHeight - margin.top - margin.bottom,
            };
        }
        const { margin, width, height } = svgRef.current._dimensions;
        svgEl.attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom);
        const g = svgEl.append("g").attr("transform", `translate(${margin.left},${margin.top})`);

        // Define scales using combinedData (which includes forecast points).
        const xDomainMin = d3.min(combinedData, d => d.Year);
        const xDomainMax = d3.max(combinedData, d => d.Year);
        const x = d3.scaleLinear().domain([xDomainMin, xDomainMax]).range([0, width]);
        const maxWater = d3.max(combinedData, d => d.WaterValue);
        const y = d3.scaleLinear().domain([0, maxWater * 1.1]).range([height, 0]);

        // Draw axes and labels.
        g.append("g").attr("transform", `translate(0,${height})`).call(d3.axisBottom(x).ticks(5))
            .selectAll("text").attr("transform", "rotate(-45)").style("text-anchor", "end");
        g.append("g").call(d3.axisLeft(y).ticks(5));
        g.append("text").attr("text-anchor", "middle").attr("x", width / 2)
            .attr("y", height + 35).style("font-weight", "bold").text("Year");
        g.append("text").attr("text-anchor", "middle").attr("transform", `translate(${-50},${height / 2}) rotate(-90)`)
            .style("font-weight", "bold").text("Water Resources (m³)");

        // Plot historical portion with blue circles and line.
        const historicalData = combinedData.filter(d => d.isHistorical);
        g.selectAll(".historical")
            .data(historicalData)
            .enter()
            .append("circle")
            .attr("cx", d => x(d.Year))
            .attr("cy", d => y(d.WaterValue))
            .attr("r", 4)
            .attr("fill", "blue")
            .attr("stroke", "black")
            .append("title")
            .text(d => `Year: ${d.Year}\nValue: ${d.WaterValue.toFixed(2)}`);
        const lineHistorical = d3.line()
            .x(d => x(d.Year))
            .y(d => y(d.WaterValue))
            .defined(d => !isNaN(d.WaterValue));
        g.append("path")
            .datum(historicalData)
            .attr("fill", "none")
            .attr("stroke", "blue")
            .attr("stroke-width", 2)
            .attr("d", lineHistorical);

        // Plot forecast portion with red dashed line.
        const forecastData = combinedData.filter(d => !d.isHistorical);
        const lineForecast = d3.line()
            .x(d => x(d.Year))
            .y(d => y(d.WaterValue))
            .defined(d => !isNaN(d.WaterValue));
        g.append("path")
            .datum(forecastData)
            .attr("fill", "none")
            .attr("stroke", "red")
            .attr("stroke-dasharray", "4 2") // dashed style for forecast
            .attr("stroke-width", 2)
            .attr("d", lineForecast);
        // Optionally, plot forecast points.
        g.selectAll(".forecast-point")
            .data(forecastData)
            .enter()
            .append("circle")
            .attr("cx", d => x(d.Year))
            .attr("cy", d => y(d.WaterValue))
            .attr("r", 3)
            .attr("fill", "red")
            .attr("stroke", "black")
            .append("title")
            .text(d => `Year: ${d.Year}\nForecast: ${d.WaterValue.toFixed(2)}`);
    };



    // Main function to process data, run training, and draw forecasts.
    useEffect(() => {
        if (!svgRef.current || !data || !data.waterData || !data.popuData || !data.tempData) return;

        // Destructure and format data.
        let { waterData = [], popuData = [], tempData = [] } = data;
        const formatData = (dataArray) =>
            dataArray.flatMap(item =>
                Object.entries(item).map(([Year, value]) => ({ Year: +Year, value: +value }))
            );
        const formatWaterData = (dataArray) => {
            const filtered = dataArray.filter(item => item.type === waterType);
            const grouped = filtered.reduce((acc, curr) => {
                const year = +curr.Year;
                const value = +curr.Value;
                acc[year] = (acc[year] || 0) + value;
                return acc;
            }, {});
            return Object.entries(grouped).map(([Year, value]) => ({ Year: +Year, value }));
        };
        waterData = formatWaterData(waterData);
        popuData = formatData(popuData);
        tempData = formatData(tempData);

        // Merge data from temperature, water, and population sources.
        function mergeData(tempData, waterData, popuData) {
            const tempArray = tempData.map(d => ({ Year: +d.Year, value: +d.value }));
            const waterArray = waterData.map(d => ({ Year: +d.Year, value: +d.value }));
            const popArray = popuData.map(d => ({ Year: +d.Year, value: +d.value }));
            const merged = tempArray.map(temp => {
                const water = waterArray.find(w => w.Year === temp.Year);
                const pop = popArray.find(p => p.Year === temp.Year);
                return {
                    Year: temp.Year,
                    TempValue: temp.value,
                    WaterValue: water ? water.value : null,
                    Population: pop ? pop.value : null,
                    isHistorical: true // mark as historical
                };
            }).filter(d => d.WaterValue !== null && d.Population !== null);
            return merged;
        }

        // Normalize data.
        function normalizeData(cityData) {
            const scaler = arr => {
                const mean = d3.mean(arr);
                const std = d3.deviation(arr) || 1;
                return { mean, std };
            };
            const tempScaler = scaler(cityData.map(d => d.TempValue));
            const popScaler = scaler(cityData.map(d => d.Population));
            const watScaler = scaler(cityData.map(d => d.WaterValue));
            cityData.forEach(d => {
                d.ScaledTemp = (d.TempValue - tempScaler.mean) / tempScaler.std;
                d.ScaledPop = (d.Population - popScaler.mean) / popScaler.std;
                d.ScaledWater = (d.WaterValue - watScaler.mean) / watScaler.std;
            });
            return {
                data: cityData,
                scalers: { temp: tempScaler, pop: popScaler, water: watScaler },
            };
        }

        // Pipeline: merge and normalize data.
        const mergedData = mergeData(tempData, waterData, popuData);
        if (!mergedData.length) {
            d3.select(svgRef.current).append("text").text(`No data for ${countryName}`);
            return;
        }
        mergedData.sort((a, b) => d3.ascending(a.Year, b.Year));
        const { data: normalizedData, scalers } = normalizeData(mergedData);

        // First, run historical drawing.
        drawHistoricalData(normalizedData);
    }, [data, waterType]);


    // Main function to process data, run training, and draw forecasts.
    const drawPredictionChart = async () => {
        if (!svgRef.current || !data || !data.waterData || !data.popuData || !data.tempData)
            return;

        // Destructure and format data.
        let { waterData = [], popuData = [], tempData = [] } = data;
        const formatData = (dataArray) =>
            dataArray.flatMap(item =>
                Object.entries(item).map(([Year, value]) => ({ Year: +Year, value: +value }))
            );
        const formatWaterData = (dataArray) => {
            const filtered = dataArray.filter(item => item.type === waterType);
            const grouped = filtered.reduce((acc, curr) => {
                const year = +curr.Year;
                const value = +curr.Value;
                acc[year] = (acc[year] || 0) + value;
                return acc;
            }, {});
            return Object.entries(grouped).map(([Year, value]) => ({ Year: +Year, value }));
        };
        waterData = formatWaterData(waterData);
        popuData = formatData(popuData);
        tempData = formatData(tempData);

        // Merge data from temperature, water, and population sources.
        function mergeData(tempData, waterData, popuData) {
            const tempArray = tempData.map(d => ({ Year: +d.Year, value: +d.value }));
            const waterArray = waterData.map(d => ({ Year: +d.Year, value: +d.value }));
            const popArray = popuData.map(d => ({ Year: +d.Year, value: +d.value }));
            const merged = tempArray.map(temp => {
                const water = waterArray.find(w => w.Year === temp.Year);
                const pop = popArray.find(p => p.Year === temp.Year);
                return {
                    Year: temp.Year,
                    TempValue: temp.value,
                    WaterValue: water ? water.value : null,
                    Population: pop ? pop.value : null,
                    isHistorical: true // mark as historical
                };
            }).filter(d => d.WaterValue !== null && d.Population !== null);
            return merged;
        }

        // Normalize data.
        function normalizeData(cityData) {
            const scaler = arr => {
                const mean = d3.mean(arr);
                const std = d3.deviation(arr) || 1;
                return { mean, std };
            };
            const tempScaler = scaler(cityData.map(d => d.TempValue));
            const popScaler = scaler(cityData.map(d => d.Population));
            const watScaler = scaler(cityData.map(d => d.WaterValue));
            cityData.forEach(d => {
                d.ScaledTemp = (d.TempValue - tempScaler.mean) / tempScaler.std;
                d.ScaledPop = (d.Population - popScaler.mean) / popScaler.std;
                d.ScaledWater = (d.WaterValue - watScaler.mean) / watScaler.std;
            });
            return {
                data: cityData,
                scalers: { temp: tempScaler, pop: popScaler, water: watScaler },
            };
        }

        // LSTM training with loss and accuracy tracking.
        async function LSTMTrainTestFuture(cityData, scalers, futureSteps) {
            const windowSize = 3;
            const X = [];
            const Y = [];
            for (let i = windowSize; i < cityData.length; i++) {
                const slice_ = cityData.slice(i - windowSize, i);
                const featuresMatrix = slice_.map(d => [d.ScaledTemp, d.ScaledPop, d.ScaledWater]);
                X.push(featuresMatrix);
                Y.push([cityData[i].ScaledWater]);
            }
            const totalSamples = X.length;
            const trainSize = Math.floor(totalSamples * 0.8);
            const Xtrain = X.slice(0, trainSize);
            const Ytrain = Y.slice(0, trainSize);
            const Xtest = X.slice(trainSize);
            const Ytest = Y.slice(trainSize);
            const tensorXtrain = tf.tensor3d(Xtrain);
            const tensorYtrain = tf.tensor2d(Ytrain);
            const tensorXtest = tf.tensor3d(Xtest);
            const tensorYtest = tf.tensor2d(Ytest);
            const model = tf.sequential();
            model.add(tf.layers.lstm({ units: 16, inputShape: [windowSize, 3] }));
            model.add(tf.layers.dense({ units: 1 }));
            model.compile({ optimizer: "adam", loss: "meanSquaredError" });

            // === Suggestion 2: Show loader and keep modal open during training.
            setTraining(true);
            setTrainingLossData([]);
            // For demonstration, we simulate an accuracy metric as 1 - loss.
            const trainingAccuracyData = [];
            await model.fit(tensorXtrain, tensorYtrain, {
                epochs: 50,
                batchSize: 4,
                verbose: 0,
                callbacks: {
                    onEpochEnd: (epoch, logs) => {
                        setTrainingLossData(prev => [...prev, { epoch, loss: logs.loss }]);
                        // NEW: Update accuracy data (placeholder computation).
                        trainingAccuracyData.push({ epoch, accuracy: 1 - logs.loss });
                        setTrainingAccuracyData([...trainingAccuracyData]);
                    }
                }
            });
            // Do not close the modal automatically; let the user click "Close" later.

            const predsTest = model.predict(tensorXtest);
            const predsTestArr = await predsTest.array();
            const YtestArr = await tensorYtest.array();
            const absErrors = predsTestArr.map((p, i) => Math.abs(p[0] - YtestArr[i][0]));
            const stdError = d3.deviation(absErrors) || 0;
            let currentWindow = cityData.slice(-windowSize).map(d => [d.ScaledTemp, d.ScaledPop, d.ScaledWater]);
            const futurePredScaled = [];
            for (let i = 0; i < futureSteps; i++) {
                const input = tf.tensor3d([currentWindow]);
                const scaledVal = model.predict(input).dataSync()[0];
                futurePredScaled.push(scaledVal);
                currentWindow.shift();
                const [lastTemp, lastPop] = currentWindow[currentWindow.length - 1];
                currentWindow.push([lastTemp, lastPop, scaledVal]);
            }
            const futurePred = futurePredScaled.map(sv => sv * scalers.water.std + scalers.water.mean);
            model.dispose();
            return { futurePred, stdError };
        }

        // Pipeline: merge and normalize data.
        const mergedData = mergeData(tempData, waterData, popuData);
        if (!mergedData.length) {
            d3.select(svgRef.current).append("text").text(`No data for ${countryName}`);
            return;
        }
        mergedData.sort((a, b) => d3.ascending(a.Year, b.Year));
        const { data: normalizedData, scalers } = normalizeData(mergedData);

        // First, run historical drawing.
        drawHistoricalData(normalizedData);

        // Run LSTM training (with loss & accuracy tracking).
        const { futurePred, stdError: stdErrorLSTM } = await LSTMTrainTestFuture(normalizedData, scalers, 10);
        // We now build forecast data.
        const lastYear = d3.max(normalizedData, d => d.Year);
        const forecastDataLSTM = [
            { Year: lastYear, WaterValue: normalizedData[normalizedData.length - 1].WaterValue, isHistorical: true },
            ...d3.range(lastYear + 1, lastYear + 11).map((year, i) => ({ Year: year, WaterValue: futurePred[i], isHistorical: false }))
        ];

        // Combine historical and forecast data for a continuous line.
        const combinedData = normalizedData.concat(forecastDataLSTM.slice(1));

        // Redraw historical data with combined data.
        drawHistoricalData(combinedData);

        setErrors({ stdErrorLSTM });
    };

    // Button handler.
    const handleGetPrediction = () => {
        drawPredictionChart();
    };

    return (
        <div className="prediction-chart-container">
            <div className="chart-pred-desc">
                {countryName &&
                    errors.stdErrorLSTM !== null && (
                        <h3>
                            Prediction of Water Resources for {countryName} LSTM: {errors.stdErrorLSTM.toFixed(2)}
                        </h3>
                    )}
            </div>
            <button onClick={handleGetPrediction} className="prediction-btn">
                <i className="fa fa-line-chart" aria-hidden="true"></i>
                <span> Predict</span>
            </button>

            <div className="pred-line-chart-container">
                <svg ref={svgRef} ></svg>
            </div>

            {training && (
                <div className="modal">
                    <div className="modal-content">
                        <h3>Training in Progress</h3>
                        <div className="loss-accuracy-plots">
                            <div className="loss-plot">
                                <h4>Loss</h4>
                                <svg ref={lossSvgRef}></svg>
                            </div>
                            <div className="accuracy-plot">
                                <h4>Accuracy</h4>
                                <svg ref={accuracySvgRef}></svg>
                            </div>
                        </div>
                        <button onClick={() => setTraining(false)}>Close</button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Prediction;
