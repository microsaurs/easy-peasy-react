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
  const popupTimerRef = useRef(null); // Timer reference
  const [isPopupVisible, setIsPopupVisible] = useState(true); // Popup visibility state, start with true
  const [currentPopup, setCurrentPopup] = useState(); // Current popup state
  const contentRef = useRef(null); // Ref for content div
  const popUpRef = useRef(null);  // Ref for pop-up div

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

    // 이미지 상태 저장 및 복원
    newCanvas.on("object:modified", (e) => {
      const obj = e.target;
      if (obj && obj.type === "image") {
        const properties = {
          left: obj.left,
          top: obj.top,
          scaleX: obj.scaleX,
          scaleY: obj.scaleY,
          angle: obj.angle,  // 이미지의 회전 상태를 저장
          flipX: obj.flipX,  // 이미지의 X축 플립 상태를 저장
          flipY: obj.flipY,  // 이미지의 Y축 플립 상태를 저장
        };
        localStorage.setItem("imageProperties", JSON.stringify(properties));
      }
    });

    // 이미지 이동 및 크기 조절 시 캔버스 경계 체크
    newCanvas.on("object:moving", (e) => {
      const obj = e.target;
      if (obj && obj.type === "image") {
        // 이미지의 새로운 위치가 캔버스의 경계를 넘지 않도록 조정
        if (obj.left < 0) obj.left = 0;
        if (obj.top < 0) obj.top = 0;
        if (obj.left + obj.getScaledWidth() > newCanvas.width) obj.left = newCanvas.width - obj.getScaledWidth();
        if (obj.top + obj.getScaledHeight() > newCanvas.height) obj.top = newCanvas.height - obj.getScaledHeight();
      }
    });

    newCanvas.on("object:scaling", (e) => {
      const obj = e.target;
      if (obj && obj.type === "image") {
        // 이미지의 크기가 캔버스의 경계를 넘어가지 않도록 조정
        if (obj.left < 0) obj.left = 0;
        if (obj.top < 0) obj.top = 0;
        if (obj.left + obj.getScaledWidth() > newCanvas.width) obj.left = newCanvas.width - obj.getScaledWidth();
        if (obj.top + obj.getScaledHeight() > newCanvas.height) obj.top = newCanvas.height - obj.getScaledHeight();
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
            angle: savedProperties.angle,  // 저장된 회전 상태 복원
            flipX: savedProperties.flipX,  // 저장된 X축 플립 상태 복원
            flipY: savedProperties.flipY,  // 저장된 Y축 플립 상태 복원
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
          lockUniScaling: true, // 종횡비를 유지하면서 크기 조절 가능
        });

        // 이미지 크기 조절 시 종횡비 유지
        imgInstance.on('scaling', () => {
          if (imgInstance.scaleX !== imgInstance.scaleY) {
            imgInstance.set({
              scaleX: imgInstance.scaleY,
              scaleY: imgInstance.scaleX,
            });
          }
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

  useEffect(() => {

	// 팝업 확인 여부
	const hasShownPopup = localStorage.getItem("hasShownPopup");

    if (!hasShownPopup) {
      // 페이지 로드 시 5초 동안 .pop-up.info를 표시
      setIsPopupVisible(true);
      setCurrentPopup("info");

      popupTimerRef.current = setTimeout(() => {
        setIsPopupVisible(false);
        localStorage.setItem("hasShownPopup", "true");
      }, 5000);

      // 닫기 버튼 클릭 시 팝업 닫기
      const handleClose = () => {
        clearTimeout(popupTimerRef.current); // 타이머 정리
        setIsPopupVisible(false);
        localStorage.setItem("hasShownPopup", "true");
      };

      // 팝업 닫기 버튼에 클릭 이벤트 리스너 추가
      const closeButtons = document.querySelectorAll(".close-btn");
      closeButtons.forEach((button) => {
        button.addEventListener("click", handleClose);
      });

      // 컴포넌트 언마운트 시 이벤트 리스너 제거
      return () => {
        closeButtons.forEach((button) => {
          button.removeEventListener("click", handleClose);
        });
      };
    } else {
      // 이미 팝업을 보여줬다면 isPopupVisible을 false로 설정
      setIsPopupVisible(false);
    }
  }, []);

  useEffect(() => {
    const contentElement = contentRef.current;
    const popUpElement = popUpRef.current;

    if (contentElement && popUpElement) {
      // isPopupVisible 상태에 따라 content와 pop-up의 클래스를 조정
      if (isPopupVisible) {
        contentElement.classList.add("blurred");
        popUpElement.classList.add("visible");

        // 현재 표시할 팝업에 따라 클래스를 조정
        popUpElement.querySelectorAll(".info, .extension, .export").forEach((element) => {
          element.style.display = "none";
        });
        if (currentPopup) {
          popUpElement.querySelector(`.${currentPopup}`).style.display = "block";
        }
      } else {
        contentElement.classList.remove("blurred");
        popUpElement.classList.remove("visible");
      }
    }
  }, [isPopupVisible, currentPopup]);

  return (
    <div className="service-component">
      <LogoComponent />
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
            ref={imgRef} // Set the ref for img element
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
            <div></div>
          </div>
        </div>
      </div>
      <div className="pop-up" ref={popUpRef}>
        <div className="info">
          <div className="close-btn">ⅹ</div>
          <div>정의가 필요한 영역을 드래그 해보세요!</div>
          <div>오른쪽 툴박스를 통해 테두리 색상과 두께를 바꿀 수 있습니다</div>
        </div>
        <div className="extension">
          <div className="close-btn">ⅹ</div>
          <div>확장자를 먼저 선택한 후에 내보내기가 가능합니다</div>
        </div>
        <div className="export">
          <div className="close-btn">ⅹ</div>
          <div>
            이미지 작업이 완료되었습니다!
            <br />한 장 더 작업하시겠어요?
          </div>
          <div>네!</div>
          <div>아니오</div>
        </div>
      </div>
    </div>
  );
};

export default ServiceComponent;
