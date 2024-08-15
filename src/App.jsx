import { useState, useRef } from "react";
import "./App.css";

function App() {
  const [inputSentence, setinputSentence] = useState(
    "THE QUICK BROWN FOX JUMPS OVER THE LAZY DOG"
  );
  const [modifications, setModifications] = useState([
    { originalChar: "", replacementChar: "" },
  ]);

  const handleNewInputSentence = (event) => {
    const inputElement = inputRef.current;
    const start = inputElement.selectionStart;
    const end = inputElement.selectionEnd;

    let newValue = event.target.value;
    newValue = newValue.toUpperCase();
    setinputSentence(newValue);

    // Maintain the cursor position even when the input is lowercase.
    setTimeout(() => {
      inputElement.setSelectionRange(start, end);
    }, 0);
  };

  const getStyledSentence = (color, getChar) => {
    const charMap = modifications.reduce((map, mod) => {
      map[mod.originalChar] = getChar(mod);
      return map;
    }, {});

    return inputSentence.split("").map((char, index) =>
      charMap[char] ? (
        <span key={index} style={{ color }}>
          {charMap[char]}
        </span>
      ) : (
        char
      )
    );
  };

  const getStyledOriginalSentence = () =>
    getStyledSentence("orange", (mod) => mod.originalChar);

  const getStyledModifiedSentence = () =>
    getStyledSentence("green", (mod) => mod.replacementChar);

  const handleDeleteModification = (index) => {
    const newModifications = modifications.filter((_, i) => i !== index);
    if (newModifications.length === 0) {
      newModifications.push({ originalChar: "", replacementChar: "" });
    }
    setModifications(newModifications);
  };

  const handleModificationChange = (index, event) => {
    const { name, value } = event.target;
    const newModifications = [...modifications];
    newModifications[index][name] = value.toUpperCase();
    setModifications(newModifications);
  };

  const addModification = () => {
    setModifications([
      ...modifications,
      { originalChar: "", replacementChar: "" },
    ]);
  };

  const inputRef = useRef(null);

  return (
    <>
      <h1>Simple Substitution Cipher Helper</h1>
      <h4>Type in your encrypted phrase:</h4>
      <input
        type="text"
        id="original"
        name="original"
        size={80}
        value={inputSentence}
        onChange={handleNewInputSentence}
        ref={inputRef}
      />
      <br />
      <br />

      <table className="phraseTable">
        <tbody>
          <tr>
            <td>Original phrase</td>
            <td className="phrase">
              <tt>{getStyledOriginalSentence()}</tt>
            </td>
          </tr>
          <tr>
            <td>Decrypted phrase</td>
            <td className="phrase">
              <tt>{getStyledModifiedSentence()}</tt>
            </td>
          </tr>
        </tbody>
      </table>

      <h4>Character substitutions:</h4>
      <p>
        If you enter a duplicate, the last one will be used (e.g. A→B, A-
        {">"}C will translate to A→C and H→S, H→
        <tt>blank</tt> will translate to H→
        <tt>blank</tt>).
      </p>
      {modifications.map((modification, index) => (
        <div key={index}>
          <input
            type="text"
            name="originalChar"
            size={5}
            maxLength={1}
            placeholder="Old"
            value={modification.originalChar}
            onChange={(event) => handleModificationChange(index, event)}
          />
          → 
          <input
            type="text"
            name="replacementChar"
            size={5}
            maxLength={1}
            placeholder="New"
            value={modification.replacementChar}
            onChange={(event) => handleModificationChange(index, event)}
          />
          <button
            id="deleteButton"
            onClick={() => handleDeleteModification(index)}
          >
            Delete
          </button>
        </div>
      ))}

      <button id="addButton" onClick={addModification}>
        Add another
      </button>
      <br />
      <br />

      <h3>Notepad</h3>
      <textarea id="notepad" size={1000} name="notepad" rows={4} cols={20} />
    </>
  );
}

export default App;
