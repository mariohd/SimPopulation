import React from 'react';
import { percentage } from '../utils.js';

function Turn(turn) {
	let mapped = Object.keys(turn).map((attr) => {
		return (
			<td key={attr}>
				{turn[attr] }
			</td>
		);
	});

	return (
		<tr key={turn.turn}>
			{mapped}
		</tr>
	);
}

class Statistics extends React.Component {
	render() {
		let turns = this.props.data.map(Turn);
		return (
			<div className='history'>
				<h2>History</h2>
				<table>
					<thead>
						<tr>
							<th>Turn</th>
							<th>Imune</th>
							<th>Resistent</th>
							<th>Infection</th>
							<th>Sick</th>
							<th>Accidents</th>
							<th>Healthy</th>
							<th>Births</th>
							<th>Dead</th>
						</tr>
					</thead>
					<tbody>
						{turns }
					</tbody>
				</table>
			</div>
		);
	}
}

export default Statistics;