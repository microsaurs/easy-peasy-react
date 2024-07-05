import React from 'react';

const Header = ({ title }) => {

  return (
    <section>
      <h1 className="fs-20 fw-b font-black align-c">{title}</h1>
    </section>
  );
};

export default Header;
