import { Link, useLocation } from "react-router-dom";

import logo from "assets/images/logo.png";

const Header = ({ title }) => {
	const location = useLocation();
	const isMain = location.pathname === "/";

	return (
		<Link to="/" style={{textDecoration:'none'}}>
			<header>
				<div className={`logo ${isMain ? "logo-main" : ""}`}>
					<img src={logo} alt="Logo" />
					<div>이지피지</div>
					<div>Easy Peasy</div>
				</div>
			</header>
		</Link>
	);
};

export default Header;
