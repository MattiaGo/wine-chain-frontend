import React from "react";
import { Container } from "react-bootstrap";

function AddRemoveMultipleInputFields({ inputFields, setInputFields }) {
  const addInputField = () => {
    setInputFields([
      ...inputFields,
      {
        par_contract: "",
        par_product_id: "",
      },
    ]);
  };

  const removeInputFields = (index) => {
    const rows = [...inputFields];
    rows.splice(index, 1);
    setInputFields(rows);
  };

  const handleChange = (index, evnt) => {
    const { name, value } = evnt.target;
    const list = [...inputFields];
    list[index][name] = value;
    setInputFields(list);
  };

  return (
    <Container className="content">
      <div className="row">
        <div className="mb-3">
          {inputFields.map((data, index) => {
            return (
              <div className="row my-3" key={index}>
                <div className="form-group mb-3">
                  <input
                    type="text"
                    onChange={(evnt) => handleChange(index, evnt)}
                    name="par_contract"
                    className="form-control"
                    placeholder="Contract Address"
                  />
                </div>
                <div className="col">
                  <input
                    type="text"
                    onChange={(evnt) => handleChange(index, evnt)}
                    name="par_product_id"
                    className="form-control"
                    placeholder="Product ID"
                  />
                </div>
                <div className="col">
                  {inputFields.length !== 0 ? (
                    <button
                      className="btn btn-outline-danger"
                      type="button"
                      onClick={removeInputFields}
                    >
                      Remove
                    </button>
                  ) : (
                    ""
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
      <div className="col-sm-12">
        <div className="mb-3">
          <button
            className="btn btn-outline-success "
            type="button"
            onClick={addInputField}
          >
            Add One
          </button>
        </div>
      </div>
    </Container>
  );
}
export default AddRemoveMultipleInputFields;
