import React from 'react';

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

export default Square;