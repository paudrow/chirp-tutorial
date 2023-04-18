export const LoadingPage = () => {
  return (
    <div className="absolute top-0 right-0 h-screen w-screen flex justify-center items-center">
      <LoadingSpinner />
    </div>
  );
};

export const LoadingSpinner = () => {
    return (
      <div
        className={"inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]"}
        role="status"
      >
        <span className="!absolute !-m-px !h-px !w-px !overflow-hidden !whitespace-nowrap !border-0 !p-0 ![clip:rect(0,0,0,0)]">
          Loading...
        </span>
      </div>
    );
}