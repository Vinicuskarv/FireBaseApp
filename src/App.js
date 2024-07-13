import { useState, useEffect } from 'react';
import { db, auth } from './firebaseConnection';
import { collection, doc, setDoc, getDocs, updateDoc, deleteDoc, onSnapshot } from 'firebase/firestore';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, onAuthStateChanged } from 'firebase/auth';

import './app.css';

function App() {
  const [titulo, setTitulo] = useState('');
  const [autor, setAutor] = useState('');
  const [idPost, setIdPost] = useState('');

  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');

  const [user, setUser] = useState(false);
  const [userDetail, setUserDetail] = useState([]);

  const [posts, setPosts] = useState([]);

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, "posts"), (querySnapshot) => {
      let listaPost = [];

      querySnapshot.forEach((doc) => {
        listaPost.push({
          id: doc.id,
          titulo: doc.data().titulo,
          autor: doc.data().autor,
        });
      });

      setPosts(listaPost);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    async function checkLogin(){
      onAuthStateChanged(auth, (user) => {
        if(user){
          
          setUser(true)
          setUserDetail({
            uid: user.uid,
            email: user.email,
          })
          
        }else{

          setUser(false)
          setUserDetail({})
        }
      })
    }

    checkLogin();
  })

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

  async function editarPost() {
    const docRef = doc(db, "posts", idPost);

    await updateDoc(docRef, {
      titulo: titulo,
      autor: autor,
    })
    .then(() => {
      console.log("Post atualizado!");
      setIdPost('');
      setAutor('');
      setTitulo('');
    })
    .catch(() => {
      console.log("Erro ao atualizar o post");
    });
  }

  async function excluirPost(id) {
    const docRef = doc(db, "posts", id);
    await deleteDoc(docRef)
    .then(() => {
      alert("Post deletado com sucesso!");
    })
    .catch((error) => {
      console.log("Erro ao deletar o post: " + error);
    });
  }

  async function novoUsuario(){
    await createUserWithEmailAndPassword(auth, email, senha)
    .then(() => {
      console.log("Cadastrado com sucesso!")
      setEmail('')
      setSenha('')
    })
    .catch((error) => {
      if(error.code === 'auth/weak-password'){
        alert("Senha muito fraca.")
      }else if(error.code === 'auth/email-already-in-use'){
        alert("Email já existe!")
      }
    })

  }
  async function logarUsuario(){
    await signInWithEmailAndPassword(auth, email, senha)

    .then((value) => {
      console.log("User Logado com sucesso!")


      setUserDetail({
        uid:value.user.uid,
        email:value.user.email,
      })
      setUser(true)

      setEmail('')
      setSenha('')
    })
    .catch((error) => {
      console.log("Erro ao fazer login")
    })
  }

  async function fazerLogout(){
    await signOut(auth)
    setUser(false)
    setUserDetail({})
  }

  return (
    <div>
      <h1>React + Firebase</h1>

      { user && (
        <div className='container'>
          <strong>Seja bem-vindo(a) (Você está logado!)</strong>
          <span>ID: {userDetail.uid} - Email: {userDetail.email}</span>
          <button onClick={fazerLogout}>Sair da conta</button>
          <br/><br/>
        </div>
      )}

      <div className='container'>
      <h2>Usuarios</h2>

        <label>Email:</label>
        <input
          placeholder='Digite um email'
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        /><br/>
        <label>Senha:</label>
        <input
          placeholder='Informe sua senha'
          value={senha}
          onChange={(e) => setSenha(e.target.value)}
          type='password'
        /><br/>

        <button onClick={novoUsuario}>Cadastrar</button>
        <button onClick={logarUsuario}>Fazer Login</button>

      </div>
      

      
      <hr/>
      

      <div className='container'>
        <h2>Posts</h2>
        <label>ID do Post:</label>
        <input
          placeholder='Digite o ID do post'
          value={idPost}
          onChange={(e) => setIdPost(e.target.value)}
        /><br/>

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
        <button onClick={buscarPosts}>Buscar posts</button><br/>

        <button onClick={editarPost}>Atualizar post</button>


        <ul>
          {posts.map((post) => {
            return (
              <li key={post.id}>
                <span>ID: {post.id}</span><br/>
                <span>Título: {post.titulo}</span><br/>
                <span>Autor: {post.autor}</span><br/>
                <button onClick={() => excluirPost(post.id)}>Excluir</button><br/><br/>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}

export default App;
