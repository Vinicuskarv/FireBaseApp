import { useState } from 'react';
import { db } from './firebaseConnection';
import { collection, doc, setDoc, getDocs } from 'firebase/firestore';

import './app.css';

function App() {
  const [titulo, setTitulo] = useState('');
  const [autor, setAutor] = useState('');
  const [posts, setPosts] = useState([]);

  async function handleAdd() {
    try {
      const docRef = doc(collection(db, "posts"));
      await setDoc(docRef, {
        titulo: titulo,
        autor: autor,
      });
      console.log("Dados registrados no banco!");
      setTitulo('');
      setAutor('');
    } catch (error) {
      console.log("Gerou um erro: " + error);
    }
  }

  async function buscarPosts() {
    const postRef = collection(db, "posts");
    try {
      const querySnapshot = await getDocs(postRef);
      let lista = [];

      querySnapshot.forEach((doc) => {
        lista.push({
          id: doc.id,
          titulo: doc.data().titulo,
          autor: doc.data().autor,
        });
      });

      setPosts(lista);
    } catch (error) {
      console.log("Deu um erro ao buscar: " + error);
    }
  }

  return (
    <div>
      <h1>React + Firebase</h1>

      <div className='container'>
        <label>Título:</label>
        <textarea
          placeholder='Digite o título'
          value={titulo}
          onChange={(e) => setTitulo(e.target.value)}
        />
        <label>Autor:</label>
        <input 
          type='text'
          placeholder='Autor do post'
          value={autor}
          onChange={(e) => setAutor(e.target.value)}
        />

        <button onClick={handleAdd}>Cadastrar</button>
        <button onClick={buscarPosts}>Buscar posts</button>

        <ul>
          {posts.map((post) => {
            return (
              <li key={post.id}>
                <span>Título: {post.titulo}</span><br/>
                <span>Autor: {post.autor}</span><br/>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}

export default App;
