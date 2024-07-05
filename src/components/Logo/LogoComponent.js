import React from "react";

import logo from "assets/images/logo.png";

const LogoComponent = () => {
	return (
		<div className="logo">
			<img src={logo} alt="Logo" />
			<div>이지피지</div>
			<div>Easy Peasy</div>
		</div>
	);
};

export default LogoComponent;
