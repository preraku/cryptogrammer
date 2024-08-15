import { useState, useRef } from "react";
import "./App.css";

function App() {
  const [inputSentence, setinputSentence] = useState(
    "THE QUICK BROWN FOX JUMPS OVER THE LAZY DOG"
  );
  // const [modifiedSentence, setModifiedSentence] = useState(
  //   inputSentence.toUpperCase()
  // );
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

    // Maintain the cursor position even when the input
    // is lowercase.
    setTimeout(() => {
      inputElement.setSelectionRange(start, end);
    }, 0);
  };

  // const createModificationsMap = (newModifications) => {
  //   const modificationsMap = new Map();
  //   newModifications.forEach((modification) => {
  //     modificationsMap.set(
  //       modification.originalChar,
  //       modification.replacementChar
  //     );
  //   });
  //   return modificationsMap;
  // };

  // const modifySentence = (modificationsMap) => {
  //   let newSentenceCharArray = inputSentence.split("");
  //   for (let i = 0; i < newSentenceCharArray.length; i++) {
  //     if (modificationsMap.has(newSentenceCharArray[i])) {
  //       newSentenceCharArray[i] = modificationsMap.get(newSentenceCharArray[i]);
  //     }
  //   }
  //   // setModifiedSentence(newSentenceCharArray.join(""));
  // };

  const getStyledOriginalSentence = (sentence, modifications) => {
    const modificationSet = modifications.reduce((set, mod) => {
      set.add(mod.originalChar);
      return set;
    }, new Set());

    return sentence.split("").map((char, index) => {
      if (modificationSet.has(char)) {
        return (
          <span key={index} style={{ color: "orange" }}>
            {char}
          </span>
        );
      }
      return char;
    });
  };

  const getStyledModifiedSentence = (sentence, modifications) => {
    const modificationMap = modifications.reduce((map, mod) => {
      map[mod.originalChar] = mod.replacementChar;
      return map;
    }, {});

    return sentence.split("").map((char, index) => {
      if (modificationMap[char]) {
        return (
          <span key={index} style={{ color: "green" }}>
            {modificationMap[char]}
          </span>
        );
      }
      return char;
    });
  };

  const handleDeleteModification = (index) => {
    const newModifications = modifications.filter((_, i) => i !== index);
    if (newModifications.length === 0) {
      newModifications.push({ originalChar: "", replacementChar: "" });
    }
    setModifications(newModifications);
    // const modificationsMap = createModificationsMap(newModifications);
    // modifySentence(modificationsMap);
  };

  const handleModificationChange = (index, event) => {
    const { name, value } = event.target;
    const newModifications = [...modifications];
    newModifications[index][name] = value.toUpperCase();
    setModifications(newModifications);

    // Only update if originalChar and replacementChar are not empty
    // if (
    //   newModifications[index].originalChar === "" ||
    //   newModifications[index].replacementChar === ""
    // ) {
    //   if (newModifications[index].replacementChar === "") {
    //     // Remove the modification from the sentence if the replacementChar is empty
    //     const modificationsMap = createModificationsMap(newModifications);
    //     modificationsMap.delete(newModifications[index].originalChar);
    //     // modifySentence(modificationsMap);
    //   }
    //   return;
    // }
    // const modificationsMap = createModificationsMap(newModifications);
    // modifySentence(modificationsMap);
    // console.log(getStyledModifiedSentence(inputSentence, newModifications));
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
            <td>Styled Original phrase</td>
            <td className="phrase">
              <tt>{getStyledOriginalSentence(inputSentence, modifications)}</tt>
            </td>
          </tr>
          <tr>
            <td>Styled Decrypted phrase</td>
            <td className="phrase">
              <tt>{getStyledModifiedSentence(inputSentence, modifications)}</tt>
            </td>
          </tr>
        </tbody>
      </table>

      <h4>Character substitutions:</h4>
      <p>
        If you enter a duplicate, the last one will be used (e.g. A-{">"}B, A-
        {">"}C will translate to A-{">"}C and H-{">"}S, H-{">"}
        <tt>blank</tt> will translate to H-{">"}
        <tt>blank</tt>).
      </p>
      {modifications.map((modification, index) => (
        <div key={index}>
          <input
            type="text"
            name="originalChar"
            size={5}
            placeholder="Old"
            value={modification.originalChar}
            onChange={(event) => handleModificationChange(index, event)}
          />
          {" -> "}
          <input
            type="text"
            name="replacementChar"
            size={5}
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
