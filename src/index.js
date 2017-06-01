import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';

class Square extends React.Component {
	render() {
		return (
			<div className={'square tooltip ' + this.props.person.class} >
				<div className='person'>{this.props.person.health}</div>
				<div className='age' >
					{`${this.props.person.age}`}
				</div>
				<div className='location tooltiptext'>
					{`Location: (${this.props.location})`}
				</div>
			</div>
		);
	}
}

class Board extends React.Component {
	constructor(props) {
		super(props);
		let population = Array(this.props.size)
							.fill(null)
							.map(() => Array(this.props.size).fill(null));
		population = population.map((e, l) => e.map((e2, c) => oneOf(l, c)));
		let line = getRandomInt(0, this.props.size - 1);
		let col = getRandomInt(0, this.props.size - 1);
		population[line][col] = infected(line, col);

		this.state = {
			population
		}
	}

	renderSquare(line, col) {
		return (<Square 
				location={`${line}, ${col}`} 
				key={`${line}, ${col}`}
				person={ this.state.population[line][col] } /> );
	}

	spreadInfection() {
		let infect = (line, col) => {
			if (line < 0 || col < 0 ||
				line >= this.props.size || col >= this.props.size) {
				return;
			}

			let population = this.state.population;
			if (population[line][col].health === 'H') {
				population[line][col] = infected(line, col);
			}

			if (population[line][col].health === 'R') {
				let odds = Math.random();

				if (odds > 0.3) {
					population[line][col] = infected(line, col);
				}
			}
			this.setState({
				population
			});
		}

		let infectOthers = (line, col) => {
			infect(line, col + 1);
			infect(line, col - 1);
			infect(line + 1, col);
			infect(line - 1, col);
		}

		let addAge = () => {
			let population = this.state.population;
			population.forEach((row, line) => {
				row.forEach((element, col) => {
					element.age ++;
				})
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
					}

					// Healthy dies after 10 turns
					if (element.age > 10 && element.health === 'H') {
						population[line][col] = vacancy(line, col);
					}

					// Infected dies after 3 turns
					if (element.age > 3 && element.health === 'S') {
						population[line][col] = vacancy(line, col);
					}

					// Resistant dies after 15 turns
					if (element.age > 15 && element.health === 'R') {
						population[line][col] = vacancy(line, col);
					}
				})
			});
		}

		addAge();
		kill();

		let infecteds = [];
		this.state.population.forEach((row, line) => {
			infecteds = infecteds.concat(row.filter((element, col) => {
				return element.health === 'S';
			}));
		});

		infecteds.forEach((element) => {
			infectOthers(element.line, element.col);
		});
	}

	createRow(number) {
		let cols = [];
		for (let i = 0; i < this.props.size; i++) {
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
			return Math.round((a / Math.pow(this.props.size, 2)) * 100) + '%';
		return '0%';
	}

	render() {
		let rows = [];
		for (let y = 0; y < this.props.size; y++) {
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
				<button className="nextTurn" onClick={() => this.spreadInfection()}>Next Turn</button>
				{rows}
				<div className='status'>
					<div className='tooltip'>
						{ `H: ${values.H? values.H : 0} `}
						<span className='tooltiptext'>
							{`Healthy: ${this.percentage(values.H)}` }
						</span>
					</div>
					<div className='resistent tooltip'>
						{ `R: ${values.R? values.R : 0} `}
						<span className='tooltiptext'>
							{`Resistent: ${this.percentage(values.R)}` }
						</span>
					</div>
					<div className='imune tooltip'>
						{ `I: ${ values.I? values.I : 0 } `}
						<span className='tooltiptext'>
							{`Imune: ${this.percentage(values.I)}` }
						</span>
					</div>
					<div className='infected tooltip'>
						{ `S: ${values.S? values.S : 0} `}
						<span className='tooltiptext'>
							{`Sick: ${this.percentage(values.S)}` }
						</span>
					</div>
					<div className='free tooltip'>
						{ `V: ${values.V? values.V : 0} `}
						<span className='tooltiptext'>
							{`Vacancy: ${this.percentage(values.V)}` }
						</span>
					</div>
				</div>
			</div>
		);
	}
}

class Game extends React.Component {
	constructor() {
		super();
		this.state = {
			size: 20
		}
	}

	render() {
		return (
			<div>
				<Board size={this.state.size} />
			</div>
		);
	}
}

// ========================================

ReactDOM.render(
	<Game />,
	document.getElementById('root')
);

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
		health: 'V',
		class: 'free',
		age: Number.POSITIVE_INFINITY,
		line,
		col
	});
}

function getRandomInt(min, max) {
	return Math.floor(Math.random() * (max - min + 1)) + min;
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
