import React from 'react';
import Modal from '@mui/material/Modal';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import CloseIcon from '@mui/icons-material/Close';


const CountryModal = ({ country, onClose, open }) => {
    if (!country) return null;

    const style = {
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: 400,
        bgcolor: 'background.paper',
        boxShadow: 24,
        p: 4,
        borderRadius: 2,
    };

    return (
        <Modal
            open={open}
            onClose={onClose}
            aria-labelledby="country-modal-title"
            aria-describedby="country-modal-description"
        >
            <Box sx={style}>
                <Button
                    className="absolute top-2 right-2"
                    onClick={onClose}
                    sx={{ position: 'absolute', top: 16, right: 16 }}
                >
                    <CloseIcon />
                </Button>

                <Typography id="country-modal-title" variant="h6" component="h2">
                    {country.name}
                </Typography>

                {country.flags?.svg && (
                    <Box
                        component="img"
                        src={country.flags.svg}
                        alt={`Flag of ${country.name}`}
                        sx={{ my: 4, mx: 'auto', display: 'block' }}
                    />
                )}

                <Typography id="country-modal-description" sx={{ mt: 2 }}>
                    <strong>Alpha-2 Code:</strong> {country.country}
                </Typography>

                <Typography sx={{ mt: 2 }}>
                    <strong>Value:</strong> {country.value}
                </Typography>
            </Box>
        </Modal>
    );
};

export default CountryModal;
