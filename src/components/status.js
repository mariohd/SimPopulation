import React from 'react';
import { percentage } from '../utils.js';

function StatusSquare(props) {
	return (
		<div className={'tooltip statistics ' + props.name }>
			{ `${props.abbr}: ${props.value} `}
			<span className='tooltiptext'>
				{`${props.name}: ${ props.percentage }` }
			</span>
		</div>
	);
}

class Status extends React.Component {
	render() {
		let squareTypes = [];
		let sortedKeys = Object.keys(this.props.types).sort()
		for (let keyIndex in sortedKeys) {
			let type = sortedKeys[keyIndex];
			squareTypes.push(
				(() => {
					let tp = this.props.types[type];
					return (
						<StatusSquare 
							key={tp.name}
							name={tp.name} 
							abbr={tp.abbr} 
							value={tp.value}
							percentage={percentage(tp.value, this.props.total)} />
					);
				})()
			);
		}

		return (
			<div className='status'>
				<h2>Status</h2>
				<h3>Turn: {this.props.turn }</h3>
				{ squareTypes }
			</div>
		);
	}
}

export default Status;