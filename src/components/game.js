import React from 'react';
import Board from './board.js';

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

export default Game;