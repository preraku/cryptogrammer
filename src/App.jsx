import { useState, useRef, useEffect } from "react";
import io from "socket.io-client";
import "./App.css";

// Local:
// const socket = io("http://localhost:8080");
const socket = io("https://app.prerak.net/");

function App() {
  const [inputSentence, setinputSentence] = useState(
    "THE QUICK BROWN FOX JUMPS OVER THE LAZY DOG"
  );
  const [modifications, setModifications] = useState([
    { originalChar: "", replacementChar: "", locked: false },
  ]);
  const [origColor, setOrigColor] = useState("#FFA500");
  const [modColor, setModColor] = useState("#008000");
  const [gameId, setGameId] = useState(null);
  const inputRef = useRef(null);

  useEffect(() => {
    socket.on("gameCreated", (gameId) => {
      setGameId(gameId);
    });

    socket.on("gameState", (state) => {
      setinputSentence(state.inputSentence);
      setModifications(state.modifications);
      setOrigColor(state.origColor);
      setModColor(state.modColor);
    });

    socket.on("gameJoined", (gameId) => {
      setGameId(gameId);
    });

    return () => {
      socket.off("gameCreated");
      socket.off("gameState");
      socket.off("gameJoined");
    };
  }, []);

  const handleNewInputSentence = (event) => {
    const inputElement = inputRef.current;
    const start = inputElement.selectionStart;
    const end = inputElement.selectionEnd;

    let newValue = event.target.value;
    newValue = newValue.toUpperCase();
    setinputSentence(newValue);
    socket.emit("updateInputSentence", { gameId, newSentence: newValue });

    // Maintain the cursor position even when the input is lowercase.
    setTimeout(() => {
      inputElement.setSelectionRange(start, end);
    }, 0);
  };

  const handleOrigColorChange = (event) => {
    const newColor = event.target.value;
    setOrigColor(newColor);
    socket.emit("updateColors", {
      gameId,
      colors: { origColor: newColor, modColor },
    });
  };

  const handleModColorChange = (event) => {
    const newColor = event.target.value;
    setModColor(newColor);
    socket.emit("updateColors", {
      gameId,
      colors: { origColor, modColor: newColor },
    });
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
    getStyledSentence(origColor, (mod) => mod.originalChar);

  const getStyledModifiedSentence = () =>
    getStyledSentence(modColor, (mod) => mod.replacementChar);

  const handleDeleteModification = (index) => {
    if (modifications[index].locked) return;
    const newModifications = modifications.filter((_, i) => i !== index);
    if (newModifications.length === 0) {
      newModifications.push({
        originalChar: "",
        replacementChar: "",
        locked: false,
      });
    }
    setModifications(newModifications);
    socket.emit("updateModifications", { gameId, newModifications });
  };

  const handleLockToggle = (index) => {
    const newModifications = [...modifications];
    newModifications[index].locked = !newModifications[index].locked;
    setModifications(newModifications);
    socket.emit("updateModifications", { gameId, newModifications });
  };

  const handleModificationChange = (index, event) => {
    const { name, value } = event.target;
    const newModifications = [...modifications];
    newModifications[index][name] = value.toUpperCase();
    setModifications(newModifications);
    socket.emit("updateModifications", { gameId, newModifications });
  };

  const addModification = () => {
    const newModifications = [
      ...modifications,
      { originalChar: "", replacementChar: "", locked: false },
    ];
    setModifications(newModifications);
    socket.emit("updateModifications", { gameId, newModifications });
  };

  const createGame = () => {
    socket.emit("createGame");
  };

  const joinGame = (gameId) => {
    // setGameId(gameId);
    socket.emit("joinGame", gameId);
  };

  return (
    <>
      <h1>Simple Substitution Cipher Helper</h1>
      <button onClick={createGame}>Create Game</button>
      <input
        type="text"
        id="gameId"
        placeholder="Enter Game ID to Join"
        onBlur={(e) => joinGame(e.target.value)}
      />
      {gameId && (
        <p>
          🟢 You are connected! Your Game ID: <tt>{gameId}</tt>
        </p>
      )}
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
          {!modification.locked && (
            <button
              className="deleteButton"
              onClick={() => handleDeleteModification(index)}
            >
              Delete
            </button>
          )}
          <button
            className="lockButton"
            onClick={() => handleLockToggle(index)}
          >
            {modification.locked ? "🔓" : "🔒 in!"}
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

      <h4>Color settings:</h4>
      <label htmlFor="origColor">Old character color:</label>
      <input
        type="color"
        id="origColor"
        name="origColor"
        value={origColor}
        onChange={handleOrigColorChange}
      />

      <label htmlFor="modColor"> New character color:</label>
      <input
        type="color"
        id="modColor"
        name="modColor"
        value={modColor}
        onChange={handleModColorChange}
      />
    </>
  );
}

export default App;
