import { useState } from "react";

const FormSelect = ({ options, label, name }) => {
  const [selectedOption, setSelectedOption] = useState("Select option");

  const handleOptionChange = (e) => setSelectedOption(e.target.value);

  return (
    <div className="row">
      <label>{label}</label>
      <select name={name} onChange={handleOptionChange} value={selectedOption}>
        <option disabled>Select option</option>
        {options.map((option, index) => (
          <option key={index} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
};

export default FormSelect;
