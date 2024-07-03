const SERVER_BASE_URI =
	process.env.NODE_ENV === 'development'
		? 'http://localhost:8000'
		: 'https://toppings.pythonanywhere.com/v1';

export default SERVER_BASE_URI;
