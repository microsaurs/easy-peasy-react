import React, { useEffect, useRef, useState } from "react";
import { useLocation } from "react-router-dom";
import * as fabric from "fabric";
import LogoComponent from "components/Logo/LogoComponent";

const ServiceComponent = () => {
	const location = useLocation();
	const [fileName, setFileName] = useState("");
	const canvasRef = useRef(null);
	const imgRef = useRef(null); // Add ref for img element
	const [canvas, setCanvas] = useState();

	useEffect(() => {
		if (location.state && location.state.fileName) {
			setFileName(location.state.fileName);
		}

		// 캔버스 생성
		const newCanvas = new fabric.Canvas(canvasRef.current, {
			width: 500,
			height: 600,
		});
		setCanvas(newCanvas);

		// 이미지 위치 및 크기 정보 저장 이벤트 핸들러
		newCanvas.on("object:modified", (e) => {
			const obj = e.target;
			if (obj && obj.type === "image") {
				const properties = {
					left: obj.left,
					top: obj.top,
					scaleX: obj.scaleX,
					scaleY: obj.scaleY,
				};
				localStorage.setItem("imageProperties", JSON.stringify(properties));
			}
		});

		// 언마운트 시 캔버스 정리
		return () => {
			newCanvas.dispose();
		};
	}, [location.state]);

	useEffect(() => {
		if (fileName && canvas && imgRef.current) {
			const imgElement = imgRef.current;

			// 이미지가 로드된 후 fabric.Image 객체를 생성하여 canvas에 추가
			const onLoad = () => {
				const imgInstance = new fabric.Image(imgElement, {
					left: 0,
					top: 0,
				});

				// 이미지의 초기 크기를 설정하고 종횡비 유지
				imgInstance.scaleToWidth(200);

				// 로컬 스토리지에서 이미지 위치 및 크기 불러오기
				const savedProperties = JSON.parse(localStorage.getItem("imageProperties"));
				if (savedProperties) {
					imgInstance.set({
						left: savedProperties.left,
						top: savedProperties.top,
						scaleX: savedProperties.scaleX,
						scaleY: savedProperties.scaleY,
					});
				} else {
					// 이미지 중앙 위치 계산
					const centerX = (canvas.width - imgInstance.getScaledWidth()) / 2;
					const centerY = (canvas.height - imgInstance.getScaledHeight()) / 2;

					imgInstance.set({
						left: centerX,
						top: centerY,
					});
				}

				// 이미지가 드래그 가능하도록 설정
				imgInstance.set({
					hasControls: true,
					hasBorders: true,
					selectable: true,
				});

				canvas.add(imgInstance);
				canvas.renderAll();
			};

			// 이미지가 이미 로드되어 있을 경우 onLoad 호출
			if (imgElement.complete) {
				onLoad();
			} else {
				imgElement.addEventListener("load", onLoad);
				return () => imgElement.removeEventListener("load", onLoad);
			}
		}
	}, [fileName, canvas]);

	return (
		<div className="service-component">
			<LogoComponent />
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
					ref={imgRef} // Set the ref for img element
					src={`http://localhost:8080/load?fileName=${fileName}`}
					style={{ display: "none" }}
				/>
				<div className="setting-box">
					<div></div>
				</div>
			</div>
			<div className="pop-up">
				<div className="info">
					<div>ⅹ</div>
					<div>정의가 필요한 영역을 드래그 해보세요!</div>
					<div>오른쪽 툴박스를 통해 테두리 색상과 두께를 바꿀 수 있습니다</div>
				</div>
				<div className="extension" style={{display:'none'}}>
					<div>ⅹ</div>
					<div>확장자를 먼저 선택한 후에 내보내기가 가능합니다</div>
				</div>
				<div className="export" style={{display:'none'}}>
					<div>ⅹ</div>
					<div>이미지 작업이 완료되었습니다!<br />한 장 더 작업하시겠어요?</div>
					<div>네!</div>
					<div>아니오</div>
				</div>
			</div>
		</div>
	);
};

export default ServiceComponent;
