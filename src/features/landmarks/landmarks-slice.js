// DUCKS pattern
import {createSlice} from reduxjs/toolkit;

const initialState = {value : 0};

const landmarksSlice = createSlice({
    name: 'landmarks',
    initialState,
    reducers:{
        add(state){
            state.value++
        }
    }
})

export const {add} = landmarksSlice.actions

export default landmarksSlice.reducers;
