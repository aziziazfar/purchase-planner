export default function StarRating({ value, onChange, readOnly = false }) {
  return (
    <span className="star-rating">
      {[1, 2, 3, 4, 5].map((star) => (
        <span
          key={star}
          className={`star ${star <= value ? 'filled' : ''} ${readOnly ? '' : 'clickable'}`}
          onClick={() => !readOnly && onChange(star)}
        >
          ★
        </span>
      ))}
    </span>
  );
}
