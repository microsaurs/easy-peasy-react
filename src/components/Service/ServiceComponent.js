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

  //캔버스
  useEffect(() => {
    if (location.state && location.state.fileName) {
      setFileName(location.state.fileName);
    }

    //캔버스 크기 일단 고정
    const newCanvas = new fabric.Canvas(canvasRef.current, {
      width: 600,
      height: 800,
    });
    setCanvas(newCanvas);

    // 이미지 이동 및 크기 조정
    const handleObjectScaling = (e) => {
      const obj = e.target;
      if (obj && obj.type === "image") {
        const newScaledWidth = obj.getScaledWidth();
        const newScaledHeight = obj.getScaledHeight();
        const canvasWidth = newCanvas.width;
        const canvasHeight = newCanvas.height;

        if (newScaledWidth > canvasWidth || newScaledHeight > canvasHeight) {
          const scaleX = canvasWidth / obj.width;
          const scaleY = canvasHeight / obj.height;
          const scale = Math.min(scaleX, scaleY);
          obj.scaleX = obj.scaleY = scale;
        }

        // 크기 조정 후 이미지의 위치를 canvas의 경계를 넘어가지 않도록 조정
        obj.set({
          left: Math.max(0, Math.min(obj.left, canvasWidth - obj.getScaledWidth())),
          top: Math.max(0, Math.min(obj.top, canvasHeight - obj.getScaledHeight())),
        });
        obj.setCoords(); // 객체의 경계를 다시 계산합니다.
      }
    };

    newCanvas.on("object:scaling", handleObjectScaling);
    newCanvas.on("object:moving", handleObjectScaling);

    // 새로고침해도 남아있도록 이미지 상태 저장 및 복원
    newCanvas.on("object:modified", (e) => {
      const obj = e.target;
      if (obj && obj.type === "image") {
        const properties = {
          left: obj.left,
          top: obj.top,
          scaleX: obj.scaleX,
          scaleY: obj.scaleY,
          angle: obj.angle,
          flipX: obj.flipX,
          flipY: obj.flipY,
        };
        localStorage.setItem("imageProperties", JSON.stringify(properties));
      }
    });

    return () => {
      newCanvas.dispose();
    };
  }, [location.state]);

  useEffect(() => {
    const loadImage = () => {
      const imgElement = imgRef.current;
      const imgInstance = new fabric.Image(imgElement, {
        left: 0,
        top: 0,
      });

      // 이미지의 너비를 캔버스의 50%로 설정
      const canvasWidth = canvas.width;
      const desiredWidth = canvasWidth * 0.5; // 50% of canvas width
      imgInstance.scaleToWidth(desiredWidth);

	  // 이미지 위치, 상태 저장된거 있으면
      const savedProperties = JSON.parse(localStorage.getItem("imageProperties"));
      if (savedProperties) {
        imgInstance.set(savedProperties);
      } else {
		//없으면 캔버스의 중앙
        const centerX = (canvas.width - imgInstance.getScaledWidth()) / 2;
        const centerY = (canvas.height - imgInstance.getScaledHeight()) / 2;
        imgInstance.set({ left: centerX, top: centerY });
      }

      //이미지 선택, 이동, 크기조절시 종횡비유지
      imgInstance.set({
        hasControls: true,
        hasBorders: true,
        selectable: true,
        lockUniScaling: true,
      });

      imgInstance.on("scaling", () => {
        if (imgInstance.scaleX !== imgInstance.scaleY) {
          imgInstance.set({
            scaleX: imgInstance.scaleY,
            scaleY: imgInstance.scaleX,
          });
        }
      });

      canvas.add(imgInstance);
      canvas.renderAll();
      setImgInstance(imgInstance);
    };

    if (fileName && canvas && imgRef.current) {
      if (imgRef.current.complete) {
        loadImage();
      } else {
        const loadHandler = () => loadImage();
        imgRef.current.addEventListener("load", loadHandler);
        return () => {
          if (imgRef.current) {
            imgRef.current.removeEventListener("load", loadHandler);
          }
        };
      }
    }
  }, [fileName, canvas]);

  //페이지를 열었을 때 안내 팝업 열기
  useEffect(() => {
    if (!localStorage.getItem("hasShownInfo")) {
      setShowInfoPopup(true);
	  //팝업외 블러
      if (contentRef.current) {
        contentRef.current.classList.add("blurred");
      }
	  //5초 지나면 닫기
      const timer = setTimeout(() => {
        setShowInfoPopup(false);
        localStorage.setItem("hasShownInfo", "true");
        if (contentRef.current) {
          contentRef.current.classList.remove("blurred");
        }
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
    if (contentRef.current) {
      contentRef.current.classList.remove("blurred");
    }
  };

  //캔버스 초기화 버튼을 눌렀을 때 이미지 상태 원래로 돌리기
  const resetCanvas = () => {
    if (imgInstance) {
      // 이전 상태의 선택된 객체 삭제
      canvas.discardActiveObject();

      imgInstance.scaleToWidth(canvas.width * 0.5);

      const centerX = (canvas.width - imgInstance.getScaledWidth()) / 2;
      const centerY = (canvas.height - imgInstance.getScaledHeight()) / 2;

      imgInstance.set({
        left: centerX,
        top: centerY,
        angle: 0,
        flipX: false,
        flipY: false,
      });
      imgInstance.setCoords(); // 크기 조정 박스 업데이트
      canvas.add(imgInstance); // 이미지 캔버스에 추가
      canvas.renderAll(); // 캔버스 렌더링

      // 이미지 상태를 로컬 스토리지에 저장
      const properties = {
        left: imgInstance.left,
        top: imgInstance.top,
        scaleX: imgInstance.scaleX,
        scaleY: imgInstance.scaleY,
        angle: imgInstance.angle,
        flipX: imgInstance.flipX,
        flipY: imgInstance.flipY,
      };
      localStorage.setItem("imageProperties", JSON.stringify(properties));
    }
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
          {/* 테스트용으로 만듦 */}
          <button onClick={resetCanvas}>캔버스 초기화</button>
          <div className="setting-color">
            <div>테두리 색상</div>
            <div className="colorchips"></div>
          </div>
          <div className="setting-thick">
            <div>테두리 두께</div>
            <div>
              <label htmlFor="thickness">너비</label>
              <input id="thickness" type="number" min={1} />
            </div>
          </div>
          <div className="setting-extension">
            <div>내보내기</div>
            <div>
              <div className="extensions">jpg</div>
              <div className="extensions">png</div>
              <div className="extensions">pdf</div>
              <div>선택하신 확장자로 내보내기</div>
            </div>
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
