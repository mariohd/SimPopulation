import React from 'react';

class Square extends React.Component {
	render() {
		return (
			<div className={`square tooltip ${this.props.person.name}`} >
				<div className='person'>{this.props.person.health}</div>
				<div className='age' >
					{`${this.props.person.age}`}
				</div>
				<div className='location tooltiptext'>
					<div>{`Location: (${this.props.location})`}</div>
					<div>{`Birthplace: (${this.props.person.birthPlace.line}, ${this.props.person.birthPlace.col})`}</div>
				</div>
			</div>
		);
	}
}

export default Square;