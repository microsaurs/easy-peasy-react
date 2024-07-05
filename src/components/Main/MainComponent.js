import { useNavigate } from "react-router-dom";


import step1 from "assets/images/step1.JPG";
import step2 from "assets/images/step2.JPG";
import step3 from "assets/images/step3.JPG";
import LogoComponent from "components/Logo/LogoComponent";

// MainComponent 컴포넌트
const MainComponent = () => {
  const navigate = useNavigate();

  const handelClick = () => {
    navigate("/file");
  };

  /**
   * STEP 데이터
   */
  const stepsData = [
    {
      step: "STEP 1",
      description: "상세기획이 필요한 \n 이미지/화면안을 \n 가져온다",
      image: step1,
    },
    {
      step: "STEP 2",
      description: "영역 정의서가 필요한 \n 영역을 드래그하고, \n 쉽게 넘버링한다",
      image: step2,
    },
    {
      step: "STEP 3",
      description: "벌써 완료! \n 이미지를 저장하고 \n 활용한다!",
      image: step3,
    },
  ];

  return (
    <div className='main-component'>
      <LogoComponent />
      <div className='description'>
        서비스기획자/PM을 위한 <span>세상 쉬운</span> 상세계획서 작성 툴
      </div>
      <div className='btn-box'>
        <button className='start-btn' onClick={handelClick}>
          시작하기
        </button>
      </div>
      <div className='steps'>
        {stepsData.map(({ step, description, image }, index) => (
          <div key={index} className='step'>
            <div className='step-title'>{step}</div>
            <img src={image} className='step-img' alt='nongdamgom' />
            <div className='step-desc'>{description}</div>
          </div>
        ))}
      </div>
      {/* <Steps /> */}
    </div>
  );
};

export default MainComponent;
