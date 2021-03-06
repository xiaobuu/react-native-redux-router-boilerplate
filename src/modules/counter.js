const INCREMENT = 'COUNTER_INCREMENT';
const DECREMENT = 'COUNTER_DECREMENT';

const initialState = {
  count: 0
};

export default function counter(state = initialState, action = {}) {
  switch (action.type) {
    case INCREMENT:
      return {
        ...state,
        count: state.count + 1
      };
    case DECREMENT:
      return {
        ...state,
        count: state.count - 1
      };
    default:
      return state;
  }
}

export function increment() {
  return {
    type: INCREMENT
  };
}

export function decrement() {
  return {
    type: DECREMENT
  };
}
