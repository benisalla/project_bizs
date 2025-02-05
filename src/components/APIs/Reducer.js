import React, { createContext, useReducer, useContext } from 'react';
import Spinner from '../MicroComponents/Spinner';

const LoaderContext = createContext();

const SHOW_LOADER = 'SHOW_LOADER';
const HIDE_LOADER = 'HIDE_LOADER';

function loaderReducer(state, action) {
  switch (action.type) {
    case SHOW_LOADER:
      return { loading: true };
    case HIDE_LOADER:
      return { loading: false };
    default:
      return state;
  }
}

export const LoaderProvider = ({ children }) => {
  const [state, dispatch] = useReducer(loaderReducer, { loading: false });

  const showLoader = () => dispatch({ type: SHOW_LOADER });
  const hideLoader = () => dispatch({ type: HIDE_LOADER });

  return (
    <LoaderContext.Provider value={{ loading: state.loading, showLoader, hideLoader }}>
      {children}
      {state.loading && <Spinner />}
    </LoaderContext.Provider>
  );
};

export const useLoader = () => useContext(LoaderContext);
