import React from "react";
import "./styles.css";
const messageFactory = (type, message, isValid) => {
  return { isValid, type, message };
};

const WARN = "warn";
const ERROR = "error";

const invalidEmail = () =>
  messageFactory(ERROR, "Data is not email address", false);
const requiredField = () => messageFactory(ERROR, "Field is required", false);
const noError = () => messageFactory(ERROR, "", true);
const noWarn = () => messageFactory(WARN, "", true);
const existingDataWarning = () =>
  messageFactory(WARN, "Data already exist", true);

const defaultValidationState = {
  error: noError(),
  warn: noWarn()
};

export default function App() {
  const [field, setField] = React.useState("");
  const [validation, setValidation] = React.useState(defaultValidationState);

  const handleOnChange = e => {
    const { value } = e.target;
    setField(value);
  };

  const handleValidation = rules => async event => {
    const { value } = event.currentTarget;

    const validationResult = await rules.reduce(
      async (validation, validate) => {
        const result = await validate(value);
        const awaitValidation = await validation;

        if (result.type === WARN && awaitValidation.warn.message)
          return awaitValidation;
        if (result.type === ERROR && !awaitValidation.error.isValid)
          return awaitValidation;
        return { ...awaitValidation, [result.type]: result };
      },
      defaultValidationState
    );
    setValidation(validationResult);
  };

  const isRequiredRule = value => (value.length ? noError() : requiredField());

  const isEmailAddress = value =>
    value.indexOf("@") >= 0 ? noError() : invalidEmail();

  const checkData = value => {
    const res = new Promise(resolve => {
      setTimeout(() => {
        if ((value === "test") | (value === "test@test.pl")) {
          resolve(existingDataWarning());
        } else {
          resolve(noWarn());
        }
      }, 1000);
    });
    return res;
  };

  const { error, warn } = validation;

  return (
    <div className="App">
      <h2>Insert "test" or "test@test.pl" to trigger async warn</h2>
      <input
        style={{
          padding: "6px 12px",
          margin: "12px"
        }}
        type="email"
        required
        value={field}
        onChange={handleOnChange}
        onBlur={handleValidation([isRequiredRule, isEmailAddress, checkData])}
      />
      {!error.isValid && (
        <div style={{ color: "FireBrick" }}>{error.message}</div>
      )}
      {warn && warn.message && (
        <div style={{ color: "gold" }}>{warn.message}</div>
      )}
    </div>
  );
}
