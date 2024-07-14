import Header from "components/common/Header";
import ServiceComponent from "components/Service/ServiceComponent";
import { Route, BrowserRouter as Router, Routes } from "react-router-dom";
import { FileImportComponent, MainComponent } from "./components";

function App() {
	return (
		<Router>
			<Header />
			<Routes>
				<Route path="/" element={<MainComponent />} />
				<Route path="/file" element={<FileImportComponent />} />
				<Route path="/service" element={<ServiceComponent />} />
			</Routes>
		</Router>
	);
}

export default App;
