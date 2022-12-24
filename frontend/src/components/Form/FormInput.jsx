import { useState } from "react";

const FormInput = ({ name, label, placeholder }) => {
  const [value, setValue] = useState("");

  return (
    <div className="row">
      <label>{label}</label>
      <input
        type="text"
        placeholder={placeholder}
        value={value}
        name={name}
        onChange={(e) => setValue(e.target.value)}
      />
    </div>
  );
};

export default FormInput;
