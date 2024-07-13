import React, { useEffect, useRef, useState } from "react";
import axios from "axios";
import { useLocation } from "react-router-dom";
import * as fabric from "fabric";

const ServiceComponent = () => {
	const location = useLocation();
	const [fileName, setFileName] = useState("");
	const canvasRef = useRef(null);
	const imgRef = useRef(null);  // Add ref for img element
	const [canvas, setCanvas] = useState();

	useEffect(() => {
		if (location.state && location.state.fileName) {
			setFileName(location.state.fileName);
		}

		// 캔버스 생성
		const newCanvas = new fabric.Canvas(canvasRef.current, {
			width: 800,
			height: 400,
		});
		setCanvas(newCanvas);

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
				imgInstance.scaleToWidth(200);
				canvas.add(imgInstance);
				canvas.renderAll();
			};

			// 이미지가 이미 로드되어 있을 경우 onLoad 호출
			if (imgElement.complete) {
				onLoad();
			} else {
				imgElement.addEventListener('load', onLoad);
				return () => imgElement.removeEventListener('load', onLoad);
			}
		}
	}, [fileName, canvas]);

	return (
		<div>
			<h1>서비스 이미지</h1>
			<p>파일 이름: {fileName}</p>
			<canvas style={{ border: "1px solid black" }} ref={canvasRef} />
			<img
				className="img"
				ref={imgRef}  // Set the ref for img element
				src={`http://localhost:8080/load?fileName=${fileName}`}
				alt="image from spring"
				style={{ display: "none" }}
			/>
		</div>
	);
};

export default ServiceComponent;
