/** Lightweight CSS space scene shared by every page. */
const StarryBackground = () => (
  <div className="space-background" aria-hidden="true">
    <div className="space-nebula space-nebula-one" />
    <div className="space-nebula space-nebula-two" />
    <div className="star-layer star-layer-far" />
    <div className="star-layer star-layer-mid" />
    <div className="star-layer star-layer-near" />
    <div className="space-moon">
      <span className="moon-crater moon-crater-one" />
      <span className="moon-crater moon-crater-two" />
      <span className="moon-crater moon-crater-three" />
    </div>
    <div className="shooting-star shooting-star-one" />
    <div className="shooting-star shooting-star-two" />
    <div className="space-horizon" />
  </div>
);

export default StarryBackground;
