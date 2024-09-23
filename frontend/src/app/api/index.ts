import authenticateDB from "./../database/models/index"; // Adjust path based on your entry point

const init = async () => {
  await authenticateDB();
};

init().catch(console.error);
