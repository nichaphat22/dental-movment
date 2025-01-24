import { createSlice } from '@reduxjs/toolkit';


//create reducer
export const questionsReducer = createSlice({
    name: 'question',
    initialState: {
        queue: [],
        answers: [],
        trace: 0,
        deadline: ''
    },
    reducers: {
        startExamAction: (state, action) => {
            const { questions, answers, deadline } = action.payload;
            state.queue = questions;
            state.answers = answers;
            state.trace = 0;
            state.deadline = deadline;
        },
        moveNextAction: (state) => {
            state.trace += 1;
        },
        movePrevAction: (state) => {
            state.trace -= 1;
        },
        resetAllAction: () => {
            return {
                queue: [],
                answers: [],
                trace: 0,
                deadline: ''
            };
        }
    }
});

export const { startExamAction, moveNextAction, movePrevAction, resetAllAction} = questionsReducer.actions;
export default questionsReducer.reducer;