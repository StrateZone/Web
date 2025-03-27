// const initialState = {
//   user: null,
//   jwt: null,
//   loading: false,
//   error: null,
//   emailError: null,
// };
// interface ActionType {
//   type: string;
//   payload?: any;
// }
// const authReducer = (state = initialState, action: ActionType) => {
//   switch (action.type) {
//     case "REGISTER_REQUEST":
//     case "LOGIN_REQUEST":
//     case "GET_USER_REQUEST":
//       return { ...state, loading: true, error: null };

//     case "REGISTER_SUCCESS":
//     case "LOGIN_SUCCESS":
//       return { ...state, loading: false, jwt: action.payload };

//     case "GET_USER_SUCCESS":
//       return { ...state, loading: false, user: action.payload };

//     case "REGISTER_FAILURE":
//       return {
//         ...state,
//         error: action.payload,
//       };
//     case "CLEAR_REGISTER_ERROR":
//       return { ...state, error: "" };

//     case "LOGIN_FAILURE":
//     case "GET_USER_FAILURE":
//       return { ...state, loading: false, error: action.payload, jwt: null };

//     default:
//       return state;

//     case "LOGOUT_SUCCESS":
//       return { ...initialState };
//   }
// };

// export default authReducer;
