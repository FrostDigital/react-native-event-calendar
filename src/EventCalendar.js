// @flow
import { View, TouchableOpacity, Image, Text } from "react-native";
import _ from "lodash";
import moment from "moment";
import React from "react";

import styleConstructor from "./style";

import EventView from "./EventView";

export default class EventCalendar extends React.Component {
	constructor(props) {
		super(props);

		const start = props.start ? props.start : 0;
		const end = props.end ? props.end : 24;

		this.styles = styleConstructor(props.styles, (end - start) * 100);
		this.state = {
			date: moment(this.props.initDate)
		};
	}

	componentDidMount() {
		if (this.props.onRef) {
			this.props.onRef(this);
		}
	}

	componentWillUnmount() {
		if (this.props.onRef) {
			this.props.onRef(undefined);
		}
	}

	static defaultProps = {
		size: 30,
		initDate: new Date(),
		formatHeader: "DD MMMM YYYY",
		mode: "day"
	};

	_getMomentUnit() {
		return this.props.mode === "week" ? "weeks" : "days";
	}

	_renderItem() {
		const {
			mode,
			width,
			format24h,
			initDate,
			scrollToFirst = true,
			start = 0,
			end = 24,
			events,
			isRefreshing,
			onRefresh
		} = this.props;
		const date = moment(initDate);

		return (
			<View style={[this.styles.container, { width }]}>
				{this.props.renderHeader(date.toDate())}
				<EventView
					mode={mode}
					date={date}
					format24h={format24h}
					formatHeader={this.props.formatHeader}
					headerStyle={this.props.headerStyle}
					renderEvent={this.props.renderEvent}
					eventTapped={this.props.eventTapped}
					events={events}
					width={width}
					styles={this.styles}
					scrollToFirst={scrollToFirst}
					isRefreshing={isRefreshing}
					onRefresh={onRefresh}
					start={start}
					end={end}
				/>
			</View>
		);
	}

	render() {
		const { width } = this.props;
		return <View style={[this.styles.container, { width }]}>{this._renderItem()}</View>;
	}
}
