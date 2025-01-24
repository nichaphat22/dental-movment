import { combineReducers, configureStore } from "@reduxjs/toolkit";

import questionsReducer  from "./question_reducer";
import resultReducer from './result_reducer';

const rootReducer = combineReducers({
    questions: questionsReducer,
    result: resultReducer,
});

const store = configureStore({
    reducer: rootReducer,
});

export default store;