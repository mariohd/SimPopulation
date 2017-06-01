import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';

class Square extends React.Component {
	render() {
		return (
			<div className={'square tooltip ' + this.props.person.class} onClick={this.props.onClick}>
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
		population = population.map((e) => e.map(oneOf));
		population[getRandomInt(0, this.props.size - 1)][getRandomInt(0, this.props.size - 1)] = initialInfection();

		this.state = {
			population
		}
	}
	renderSquare(line, col) {
		return (<Square 
				location={`${line}, ${col}`} 
				key={`${line}, ${col}`}
				person={ this.state.population[line][col] } 
				onClick={() => this.handleClick(line, col) }/> );
	}

	handleClick(line, col) {
		let population = this.state.population;
		population[line][col] = initialInfection();
		this.setState({
			population
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
				</div>
			</div>
		);
	}
}

class Game extends React.Component {
	constructor() {
		super();
		this.state = {
			size: 6
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

function initialInfection() {
	return Object.assign({},{
		health: 'S',
		class: 'infected',
		age: 1
	});
}

function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function oneOf() {
	const HEALTHY = {
		health: 'H',
		class: 'healthy',
		age: 1
	};
	const RESISTENT = {
		health: 'R',
		class: 'resistent',
		age: 1
	};
	const IMUNE = {
		health: 'I',
		class: 'imune',
		age: 1
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
