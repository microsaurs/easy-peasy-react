import { useEffect, useRef, useState } from "react";
import { useLocation } from "react-router-dom";
import * as fabric from "fabric";
import axios from "axios";

const ServiceComponent = () => {
	const location = useLocation();
	const [fileName, setFileName] = useState("");
	const canvasRef = useRef(null);
	const imgRef = useRef(null);
	const [canvas, setCanvas] = useState();
	const [imgInstance, setImgInstance] = useState(null);
	const contentRef = useRef(null);
	const [showInfoPopup, setShowInfoPopup] = useState(false);
	const [popupTimer, setPopupTimer] = useState(null);

	//페이지를 열었을 때 안내 팝업 열기
	useEffect(() => {
		if (!localStorage.getItem("hasShownInfo")) {
			setShowInfoPopup(true);
			contentRef.current.classList.add("blurred");

			const timer = setTimeout(() => {
				setShowInfoPopup(false);
				localStorage.setItem("hasShownInfo", "true");
				contentRef.current.classList.remove("blurred");
			}, 5000);

			setPopupTimer(timer);
		}
	}, []);

	//5초가 지나기 전 팝업 닫기
	const handleClosePopup = () => {
		setShowInfoPopup(false);
		localStorage.setItem("hasShownInfo", "true");
		if (popupTimer) {
			clearTimeout(popupTimer);
			setPopupTimer(null);
		}
		contentRef.current.classList.remove("blurred");
	};

	return (
		<div className="service-component">
			<div className="content" ref={contentRef}>
				<div className="canvas-box">
					<input
						className="file-name"
						type="text"
						placeholder="파일명을 설정하세요"
					/>
					<canvas
						className="canvas"
						style={{ border: "1px solid black" }}
						ref={canvasRef}
					/>
					<img
						className="img"
						ref={imgRef}
						src={`http://localhost:8080/load?fileName=${fileName}`}
						style={{ display: "none" }}
					/>
				</div>
				<div className="setting-box">
					<div className="setting-color">
						<div>테두리 색상</div>
						<div className="colorchips"></div>
					</div>
					<div className="setting-thick">
						<div>테두리 두께</div>
						<input type="number" min={1} />
					</div>
					<div className="setting-extension">
						<div>내보내기</div>
						<div>
							<div>jpg</div>
							<div>png</div>
							<div>pdf</div>
						</div>
						<div>선택하신 확장자로 내보내기</div>
					</div>
				</div>
			</div>
			<div className="pop-up-container">
				{showInfoPopup && (
					<div className="info pop-up visible">
						<div className="close-btn" onClick={handleClosePopup}>
							ⅹ
						</div>
						<div className="msg">
							<div>정의가 필요한 영역을 드래그 해보세요!</div>
							<div>오른쪽 툴박스를 통해 테두리 색상과 두께를 바꿀 수 있습니다</div>
						</div>
					</div>
				)}
				<div className="extension pop-up">
					<div className="close-btn">ⅹ</div>
					<div className="msg">확장자를 먼저 선택한 후에 내보내기가 가능합니다</div>
				</div>
				<div className="export pop-up">
					<div className="close-btn">ⅹ</div>
					<div className="msg">
						<div>
							이미지 작업이 완료되었습니다!
							<br />한 장 더 작업하시겠어요?
						</div>
						<div>
							<button>네!</button>
							<button>아니오</button>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
};

export default ServiceComponent;
