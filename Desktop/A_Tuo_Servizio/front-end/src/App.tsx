import Header from './componenti/layout/Header/Header';
import Footer from './componenti/layout/Footer/Footer';
import AppRouter from './router/index.tsx'; 

function App() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Header />
      <main style={{ flexGrow: 1 }}>
        <AppRouter />
      </main>
      <Footer />
    </div>
  );
}

export default App;
