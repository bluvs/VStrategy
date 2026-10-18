import './index.css';
import Sidebar from './components/Sidebar';
import CanvasArea from './components/CanvasArea';
import AgentBottomBar from './components/AgentBottomBar';

function App() {
  return (
    <div className="w-full h-screen flex flex-col bg-[#0f1923] text-[#ece8e1] overflow-hidden">
      <div className="flex flex-1 relative">
        <Sidebar />
        <CanvasArea />
        <AgentBottomBar />
      </div>
    </div>
  );
}

export default App;
