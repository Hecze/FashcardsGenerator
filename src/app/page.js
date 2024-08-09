"use client"; // Esto indica que el componente se ejecuta en el cliente
import React, { useState } from 'react';
import { FaEdit, FaTrash, FaDownload } from 'react-icons/fa';

const FlashcardsApp = () => {
  const [description, setDescription] = useState('');
  const [flashcards, setFlashcards] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [editingIndex, setEditingIndex] = useState(null);
  const [editQuestion, setEditQuestion] = useState('');
  const [editAnswer, setEditAnswer] = useState('');

  const handleInputChange = (e) => {
    setDescription(e.target.value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Verificar si la descripción ya existe en las flashcards
    if (flashcards.some(card => card.question === description)) {
      setError('Esta descripción ya existe.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/flashcards', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ description }),
      });

      if (!response.ok) {
        throw new Error('Error fetching flashcards');
      }

      const data = await response.json();
      setFlashcards([...flashcards, ...data.flashcards]);
      setDescription(''); // Limpiar la descripción después de enviar
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleEditClick = (index) => {
    setEditingIndex(index);
    setEditQuestion(flashcards[index].question);
    setEditAnswer(flashcards[index].answer);
  };

  const handleEditSubmit = (index) => {
    const updatedFlashcards = flashcards.map((card, i) =>
      i === index ? { ...card, question: editQuestion, answer: editAnswer } : card
    );
    setFlashcards(updatedFlashcards);
    setEditingIndex(null);
  };

  const handleDelete = (index) => {
    setFlashcards(flashcards.filter((_, i) => i !== index));
  };

  const handleDownloadApkg = async () => {
    try {
      const response = await fetch('/api/generate-apkg', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ flashcards }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate APKG file');
      }

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'flashcards.apkg';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } catch (error) {
      window.alert('Error descargando el archivo APKG: ' + error.message);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center py-10 pt-36 px-6">
      <h1 className="text-3xl font-bold text-gray-800 mb-8">Generador de Flashcards</h1>

      <form onSubmit={handleSubmit} className="w-full max-w-lg bg-white shadow-lg rounded-lg p-6">
        <input
          type="text"
          value={description}
          onChange={handleInputChange}
          placeholder="Describe qué tipo de flashcards deseas..."
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
        <button
          type="submit"
          className={`w-full mt-4 bg-indigo-500 text-white py-2 px-4 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-opacity duration-200 ${loading ? 'opacity-50' : 'hover:bg-indigo-600'}`}
          disabled={loading}
        >
          {loading ? 'Cargando...' : 'Enviar'}
        </button>
      </form>

      {error && <div className="mt-4 text-red-500">{error}</div>}

      {flashcards.length > 0 && (
        <button
          onClick={handleDownloadApkg}
          className="mt-8 bg-green-500 text-white py-2 px-4 rounded-lg flex items-center space-x-2"
        >
          <FaDownload />
          <span>Descargar Flashcards</span>
        </button>
      )}

      <div className="mt-10 w-full max-w-4xl">
        {flashcards.length > 0 && (
          <div>
            <h2 className="text-2xl font-semibold text-gray-700 mb-6">Flashcards Generadas:</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {flashcards.map((card, index) => (
                <div
                  key={index}
                  className="bg-white shadow-md rounded-lg p-4 text-center border border-gray-200 relative"
                >
                  {editingIndex === index ? (
                    <div>
                      <input
                        type="text"
                        value={editQuestion}
                        onChange={(e) => setEditQuestion(e.target.value)}
                        placeholder="Pregunta"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg mb-2"
                      />
                      <input
                        type="text"
                        value={editAnswer}
                        onChange={(e) => setEditAnswer(e.target.value)}
                        placeholder="Respuesta"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg mb-2"
                      />
                      <button
                        onClick={() => handleEditSubmit(index)}
                        className="w-full bg-indigo-500 text-white py-2 px-4 rounded-lg"
                      >
                        Guardar
                      </button>
                      <button
                        onClick={() => setEditingIndex(null)}
                        className="w-full mt-2 bg-red-500 text-white py-2 px-4 rounded-lg"
                      >
                        Cancelar
                      </button>
                    </div>
                  ) : (
                    <div>
                      <h3 className="text-xl font-medium text-indigo-600 mb-2">{card.question}</h3>
                      <p className="text-gray-700">{card.answer}</p>
                      <div className="absolute top-2 right-2 flex space-x-2">
                        <button onClick={() => handleEditClick(index)} className="text-blue-500 hover:text-blue-700">
                          <FaEdit />
                        </button>
                        <button onClick={() => handleDelete(index)} className="text-red-500 hover:text-red-700">
                          <FaTrash />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default FlashcardsApp;
