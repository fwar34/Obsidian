promise = new Promise((resolve, reject) => {
	console.log('11111');
	setTimeout(() => {
		resolve('操作完成');
	}, 1000);
	console.log('22222');
});

console.log('33333');
promise.then(result => {
	console.log(result);
}).catch(error => {
	console.error(error);
});

console.log('44444');

async function readSetting() {
	console.log('readSetting 1111');
	let setting = Object.assign({}, 'mysetting', {'name': 'feng', 'age': 38});
	console.log('readSetting 2222');
}

async function main() {
	console.log('main 1111');
	await readSetting();
	console.log('main 2222');
}

main();

