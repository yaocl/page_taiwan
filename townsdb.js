async function initdb() {
	let config = {
		locateFile: filename => `https://cdnjs.cloudflare.com/ajax/libs/sql.js/1.9.0/sql-wasm.wasm`
	};
	const sqlPromise = initSqlJs(config);
	const dataPromise = fetch("csv/townsnote.db").then(res => res.arrayBuffer());
	const [SQL, buf] = await Promise.all([sqlPromise, dataPromise])
	const sqlitedb = new SQL.Database(new Uint8Array(buf));
	window.sqlitedb = sqlitedb;
};

initdb();

function get_town_by_id(id) {
	if(!window.sqlitedb) return;
	let towns = window.sqlitedb.exec("SELECT * FROM towns where id="+id);
	// console.log("towns=", towns);
	// towns is now [{columns:['col1','col2',...], values:[[first row], [second row], ...]}]
	return towns_to_json(towns);
};

function towns_to_json(towns) {
	if( towns.length<=0 ) {
		return {};
	}
	let res;

	// console.log("towns=", towns);
	switch( towns[0].values.length ) {
	case 0:
		res = {};
		break;
	case 1:
		res = town_to_json(towns[0].columns, towns[0].values[0]);
		break;
	default:
		res = [];
		for(let i=0; i< towns[0].values.length; i++) {
			res.push( town_to_json(towns[0].columns, towns[0].values[i]) );
		}
		break;
	}
	// console.log("res=", res);
	return res;
};

function town_to_json(columns, values) {
	let json = {};
	for(let i=0; i< columns.length; i++) {
		json[columns[i]] = values[i];
	}
	return json;
};

// function test() {
// 	var towns = [{"columns":["id","cityid","city","town","note"],"values":[[9007010,9007,"連江縣","南竿鄉","南竿鄉note"]]}];
// 	var towns_res = towns_to_json(towns);
// 	console.log("towns_res=", towns_res);

// 	towns = [{"columns":["id","cityid","city","town","note"],"values":[[9007010,9007,"連江縣","南竿鄉","南竿鄉note"], [9007020,9007,"連江縣","北竿鄉","北竿鄉note"] ]}];
// 	towns_res = towns_to_json(towns);
// 	console.log("towns_res=", towns_res);

// 	towns = [{"columns":["id","cityid","city","town","note"],"values":[]}];
// 	towns_res = towns_to_json(towns);
// 	console.log("towns_res=", towns_res);
// }

// test();