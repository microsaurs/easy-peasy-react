import React from "react";
import { useNavigate } from "react-router-dom";
import { useRef } from "react";
import LogoComponent from "components/Logo/LogoComponent";

const FileImportComponent = () => {
	const navigate = useNavigate();
	const fileInputRef = useRef(null);
	const dragFileRef = useRef(null);

	/**
	 * 파일 업로드 처리 함수
	 */
	const onUpload = async (file) => {
		if (file) {
			// 업로드 로직
			navigate("/service");
		}
	};

	/**
	 * 파일 선택 및 드롭 처리 함수
	 */
	const handleFile = (file) => {
		if (file) {
			onUpload(file);
		}
	};

	/**
	 * 파일 드래그 상태 변경 및 드롭 시 호출되는 함수
	 */
	const handleDragAndDrop = (e, isDragging = false) => {
		e.preventDefault();
		if (dragFileRef.current) {
			if (e.type === 'drop') {
				dragFileRef.current.classList.remove("dragging");
				const file = e.dataTransfer.files[0];
				handleFile(file);
			} else {
				dragFileRef.current.classList.toggle("dragging", isDragging);
			}
		}
	};

	/**
	 * 파일 입력창을 클릭하는 함수
	 */
	const handleClick = () => {
		fileInputRef.current.click();
	};

	return (
		<div className="file-import-component">
			<LogoComponent />
			<div className="file-box">
				<div className="open-finder" onClick={handleClick}>
					<div>👀 이미지 불러오기</div>
					<div>jpg, png, ~ 파일을 불러오세요</div>
				</div>
				<div
					className="drag-file"
					ref={dragFileRef}
					onDragOver={(e) => handleDragAndDrop(e, true)}
					onDragLeave={(e) => handleDragAndDrop(e, false)}
					onDrop={handleDragAndDrop}
				>
					파일을 여기로 끌어오시는 것도 가능해요!
				</div>
				<input
					type="file"
					accept="image/*"
					onChange={(e) => handleFile(e.target.files[0])}
					ref={fileInputRef}
				/>
			</div>
		</div>
	);
};

export default FileImportComponent;
