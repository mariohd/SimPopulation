import React from 'react';
import Square from './square.js';
import Status from './status.js';
import {INFECTED, RESISTENT, IMUNE, DEAD, HEALTHY } from '../models/people.js';
import { randomInt } from '../utils.js';

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
		let line = randomInt(0, size - 1);
		let col = randomInt(0, size - 1);
		population[line][col] = newInfected(line, col);

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
				population[line][col] = newInfected(line, col);
				infection++;
				this.setState({
					population
				});
			}

			if (population[line][col].health === 'R') {
				let odds = Math.random();

				if (odds > 0.3) {
					population[line][col] = newInfected(line, col);
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
					element.name = element.name.replace('born', '');	
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

					// newInfected dies after 3 turns
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
						person.name += ' born'
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

		let newInfecteds = [];
		this.state.population.forEach((row, line) => {
			newInfecteds = newInfecteds.concat(row.filter((element, col) => {
				return element.health === 'S';
			}));
		});

		newInfecteds.forEach((element) => {
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

		let types = {};
		this.state.population.forEach((line) => {
			line.forEach((element) => {
				types[element.health] = {
					abbr: element.health,
					name: element.name,
					value: (types[element.health]? types[element.health].value : 0) + 1
				}
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
						<button className="action" onClick={() => this.setState(this.getInitialState(this.state.size)) }>Reset</button>
					</div>
					<Status types={types} total={Math.pow(this.state.size, 2)}/>
				</span>
			</div>
		);
	}
}

function newInfected(line, col) {
	return Object.assign({line, col}, INFECTED);
}

function vacancy(line, col) {
	return Object.assign({line, col}, DEAD);
}

function newBorn(line, col) {
	let odds = Math.random();
	switch (true) {
		case (0.85 > odds):
			return Object.assign({line, col}, RESISTENT);
		default:
			return Object.assign({line, col}, IMUNE);
	}
}

function oneOf(line, col) {
	let odds = Math.random();
	switch (true) {
		case (0.85 > odds):
			return Object.assign({line, col}, HEALTHY);
		case (odds > 0.85 && odds < 0.95):
			return Object.assign({line, col}, RESISTENT);
		default:
			return Object.assign({line, col}, IMUNE);
	}
}

export default Board;