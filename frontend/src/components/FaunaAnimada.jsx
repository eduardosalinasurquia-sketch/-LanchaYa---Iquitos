import React from 'react';
import './fauna.css';

export default function FaunaAnimada() {
  return <div className="fauna" aria-hidden="true">
    <div className="tucan-realista animal-capas">
      <img className="tucan-base" src="/tucan-realista.png" alt="" draggable="false" />
      <img className="tucan-gesto" src="/tucan-realista.png" alt="" draggable="false" />
      <img className="tucan-plumas" src="/tucan-realista.png" alt="" draggable="false" />
    </div>
    <div className="mono-realista animal-capas">
      <img className="mono-rama-fija" src="/mono-realista.png" alt="" draggable="false" />
      <img className="mono-cuerpo-real" src="/mono-realista.png" alt="" draggable="false" />
    </div>
  </div>;
}
