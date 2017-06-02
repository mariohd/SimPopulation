import React from 'react';
import Square from './square.js';

class Board extends React.Component {
	constructor(props) {
		super(props);
		this.state = this.getInitialState();
	}

	getInitialState(size = this.props.size) {
		let population = Array(size)
							.fill(null)
							.map(() => Array(size).fill(null));
		population = population.map((e, l) => e.map((e2, c) => oneOf(l, c)));
		let line = getRandomInt(0, size - 1);
		let col = getRandomInt(0, size - 1);
		population[line][col] = infected(line, col);

		return {
			population,
			size,
			turn: 1,
			history: []
		}
	}

	renderSquare(line, col) {
		return (<Square 
				location={`${line}, ${col}`} 
				key={`${line}, ${col}`}
				person={ this.state.population[line][col] } /> );
	}

	spreadInfection() {
		let healthy = 0, 
			resistent  = 0, 
			imune = 0, 
			sick = 0, 
			infection = 0, 
			accidents = 0, 
			birth = 0,
			dead = 0;

		let infect = (line, col) => {
			if (line < 0 || col < 0 ||
				line >= this.state.size || col >= this.state.size) {
				return;
			}

			let population = this.state.population;
			if (population[line][col].health === 'H') {
				population[line][col] = infected(line, col);
				infection++;
				this.setState({
					population
				});
			}

			if (population[line][col].health === 'R') {
				let odds = Math.random();

				if (odds > 0.3) {
					population[line][col] = infected(line, col);
					infection++;
					this.setState({
						population
					});
				}
			}
		}

		let infectOthers = (line, col) => {
			infect(line, col + 1);
			infect(line, col - 1);
			infect(line + 1, col);
			infect(line - 1, col);
		}

		let getMomentInHistory = () => {
			let population = this.state.population;
			population.forEach((row, line) => {
				row.forEach((element, col) => {
					switch(element.health) {
						case 'H':
							healthy ++;
							break;
						case 'R':
							resistent ++;
							break;
						case 'I':
							imune ++;
							break;
						case '\u2020':
							break;
						default:
							sick ++;
						}
				});
			});
		}

		let addAge = () => {
			let population = this.state.population;
			population.forEach((row, line) => {
				row.forEach((element, col) => {
					element.age ++;
					element.class = element.class.replace('born', '');	
				});
			});

			this.setState({
				population
			});
		}

		let kill = () => {
			let population = this.state.population;
			population.forEach((row, line) => {
				row.forEach((element, col) => {
					let odds = Math.random();

					// accidents may happen to us all
					if (odds < 0.1) {
						population[line][col] = vacancy(line, col);
						accidents++;
					}

					// Healthy/Imune dies after 10 turns
					if (element.age > 10 && (element.health === 'H' || element.health === 'I')) {
						population[line][col] = vacancy(line, col);
						dead++;
					}

					// Infected dies after 3 turns
					if (element.age > 3 && element.health === 'S') {
						population[line][col] = vacancy(line, col);
						dead++;
					}

					// Resistant dies after 4 turns
					if (element.age > 4 && element.health === 'R') {
						population[line][col] = vacancy(line, col);
						dead++;
					}
				})
			});

			this.setState({
				population
			});
		}

		let fillBornChildren = () => {
			let population = this.state.population;
			population.forEach((row, line) => {
				row.forEach((element, col) => {
					if (element.health !== '\u2020') {
						return;
					}
					let odds = Math.random();
					if (odds < 0.80) {
						let person = newBorn(line, col);
						person.class += ' born'
						population[line][col] = person;
						birth++;
					}
				})
			});

			this.setState({
				population
			});
		}

		addAge();
		kill();
		fillBornChildren();

		let infecteds = [];
		this.state.population.forEach((row, line) => {
			infecteds = infecteds.concat(row.filter((element, col) => {
				return element.health === 'S';
			}));
		});

		infecteds.forEach((element) => {
			infectOthers(element.line, element.col);
		});

		getMomentInHistory();

		let history = this.state.history;
		history.push({
			turn: this.state.turn,
			imune,
			resistent,
			infection,
			sick,
			accidents,
			healthy,
			birth,
			dead
		});

		this.setState({
			turn: this.state.turn + 1,
			history
		});
	}

	createRow(number) {
		let cols = [];
		for (let i = 0; i < this.state.size; i++) {
			cols.push(this.renderSquare(number, i));
		}
		return (
			<div key={number} className="board-row">
				{cols}
			</div>
		);
	}

	percentage(a) {
		if (a)
			return Math.round((a / Math.pow(this.state.size, 2)) * 100) + '%';
		return '0%';
	}

	changeSize(event) {
		let size = parseInt(event.currentTarget.value, 10);
		let state = this.getInitialState(size || 1);
		this.setState(state);
	}

	render() {
		let rows = [];
		for (let y = 0; y < this.state.size; y++) {
			rows.push(this.createRow(y));
		}
		let values = {};
		this.state.population.forEach((line) => {
			line.forEach((element) => {
				if (! values[element.health]) {
					values[element.health] = 0;
				}
				values[element.health] += 1;
			});
		});
		return (
			<div className='board'>
				<div className="population">{rows}</div>
				<span className="panel">
					<div className="commands perspective">
						<h2>Commands</h2>
						Size: <input className="action" type="number" min={1} onBlur={this.changeSize.bind(this)}></input>
						<button className="action" onClick={ () => this.spreadInfection() }>Next Turn</button>
						<button className="action" onClick={() => this.setState(this.getInitialState()) }>Reset</button>
					</div>
					<div className='status'>
						<h2>Status</h2>
						<div className='tooltip statistics'>
							{ `H: ${values.H? values.H : 0} `}
							<span className='tooltiptext'>
								{`Healthy: ${this.percentage(values.H)}` }
							</span>
						</div>
						<div className='resistent tooltip statistics'>
							{ `R: ${values.R? values.R : 0} `}
							<span className='tooltiptext'>
								{`Resistent: ${this.percentage(values.R)}` }
							</span>
						</div>
						<div className='imune tooltip statistics'>
							{ `I: ${ values.I? values.I : 0 } `}
							<span className='tooltiptext'>
								{`Imune: ${this.percentage(values.I)}` }
							</span>
						</div>
						<div className='infected tooltip statistics'>
							{ `S: ${values.S? values.S : 0} `}
							<span className='tooltiptext'>
								{`Sick: ${this.percentage(values.S)}` }
							</span>
						</div>
						<div className='free tooltip statistics'>
							{ `\u2020: ${values['\u2020']? values['\u2020'] : 0} `}
							<span className='tooltiptext'>
								{`Vacancy: ${this.percentage(values['\u2020'])}` }
							</span>
						</div>
					</div>
				</span>
			</div>
		);
	}
}

function infected(line, col) {
	return Object.assign({},{
		health: 'S',
		class: 'infected',
		age: 1,
		line,
		col
	});
}

function vacancy(line, col) {
	return Object.assign({},{
		health: '\u2020',
		class: 'free',
		age: Number.POSITIVE_INFINITY,
		line,
		col
	});
}

function getRandomInt(min, max) {
	return Math.floor(Math.random() * (max - min + 1)) + min;
}

function newBorn(line, col) {
	const RESISTENT = {
		health: 'R',
		class: 'resistent',
		age: 1,
		line,
		col
	};
	const IMUNE = {
		health: 'I',
		class: 'imune',
		age: 1,
		line,
		col
	};

	let chances = Math.random();
	switch (true) {
		case (0.85 > chances):
			return Object.assign({}, RESISTENT);
		default:
			return Object.assign({}, IMUNE);
	}
}

function oneOf(line, col) {
	const HEALTHY = {
		health: 'H',
		class: 'healthy',
		age: 1,
		line,
		col
	};
	const RESISTENT = {
		health: 'R',
		class: 'resistent',
		age: 1,
		line,
		col
	};
	const IMUNE = {
		health: 'I',
		class: 'imune',
		age: 1,
		line,
		col
	};

	let chances = Math.random();
	switch (true) {
		case (0.85 > chances):
			return Object.assign({}, HEALTHY);
		case (chances > 0.85 && chances < 0.95):
			return Object.assign({}, RESISTENT);
		default:
			return Object.assign({}, IMUNE);
	}
}

export default Board;