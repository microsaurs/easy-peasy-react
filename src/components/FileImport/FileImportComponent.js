import axios from "axios";
import { useRef, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const FileImportComponent = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const dragFileRef = useRef(null);
  const popUpRef = useRef(null); // Ref for pop-up div
  const contentRef = useRef(null); // Ref for content div
  const [showPopup, setShowPopup] = useState(false); // State to control popup visibility
  const [popupTimer, setPopupTimer] = useState(null); // Timer reference for automatic popup close

  /**
   * 파일 업로드 처리 함수
   */
  const onUpload = async (file) => {
    if (file) {
      const formData = new FormData();
      formData.append("file", file);

      try {
        const response = await axios.post(
          "http://localhost:8080/upload",
          formData,
          {
            headers: {
              "Content-Type": "multipart/form-data",
            },
          }
        );

        const data = response.data;
        const { fileName } = data;

        // 페이지 이동 전 localStorage 비우기
        localStorage.removeItem("imageProperties");
        localStorage.removeItem("hasShownInfo");

        // 페이지 이동 시 파일 이름을 state로 전달
        navigate("/service", { state: { fileName } });
      } catch (error) {
        console.error("파일 업로드 중 오류 발생:", error);
      }
    }
  };

  /**
   * 파일 선택 및 드롭 처리 함수
   */
  const handleFile = (file) => {
    const allowedExtensions = ["jpg", "jpeg", "png"]; // 허용된 확장자 목록

    if (file) {
      const fileExtension = file.name.split(".").pop().toLowerCase();
      if (allowedExtensions.includes(fileExtension)) {
        onUpload(file);
      } else {
        showUnsupportedFilePopup(); // 지원하지 않는 파일 확장자의 경우 팝업 표시
      }
    }
  };

  /**
   * 파일 드래그 상태 변경 및 드롭 시 호출되는 함수
   */
  const handleDragAndDrop = (e, isDragging = false) => {
    e.preventDefault();
    if (dragFileRef.current) {
      if (e.type === "drop") {
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

  /**
   * 지원하지 않는 파일 확장자에 대한 팝업을 표시하는 함수
   */
  const showUnsupportedFilePopup = () => {
    setShowPopup(true);

    // 5초 후 자동으로 팝업 닫기
    const timer = setTimeout(() => {
      setShowPopup(false);
      setPopupTimer(null);
    }, 5000);

    setPopupTimer(timer);
  };

  /**
   * 팝업 닫기 함수
   */
  const handleClosePopup = () => {
    setShowPopup(false);
    if (popupTimer) {
      clearTimeout(popupTimer); // 자동 닫기 타이머 정리
      setPopupTimer(null);
    }
  };
  
  useEffect(() => {
    const toggleClass = (ref, className, condition) => {
      if (ref.current) {
        ref.current.classList.toggle(className, condition);
      }
    };
  
    toggleClass(popUpRef, 'visible', showPopup);
    toggleClass(contentRef, 'blurred', showPopup);
  }, [showPopup]);
  

  return (
    <div className="file-import-component">
      <div className="file-box" ref={contentRef}>
        <div>🧚 이지피지는 한 번에 한 장씩만 작업이 가능해요</div>
        <div className="open-finder" onClick={handleClick}>
          <div>이미지 불러오기</div>
          <div>jpg, png, ~ 파일을 불러오세요</div>
        </div>
        <div
          className="drag-file"
          ref={dragFileRef}
          onDragOver={(e) => handleDragAndDrop(e, true)}
          onDragLeave={(e) => handleDragAndDrop(e, false)}
          onDrop={handleDragAndDrop}
        >
          <div>이미지 끌어오기</div>
          <div>이미지를 이 곳으로 끌어오세요</div>
        </div>
        <input
          type="file"
          accept="image/*"
          onChange={(e) => handleFile(e.target.files[0])}
          ref={fileInputRef}
          style={{ display: "none" }}
        />
      </div>
      {/* 팝업 */}
      <div className="pop-up-container">
        {showPopup && (
          <div className="sorry pop-up visible" ref={popUpRef}>
            <div className="close-btn" onClick={handleClosePopup}>
              ✕
            </div>
            <div className="msg">죄송합니다. 지원하고 있지 않은 확장자입니다</div>
          </div>
        )}
      </div>
    </div>
  );
};

export default FileImportComponent;
