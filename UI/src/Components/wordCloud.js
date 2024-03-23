import React from 'react';
import WordCloud from 'react-wordcloud';

const MyWordCloud = React.memo(({ words, options }) => 
    <div style={{width: '600px', height: '400px'}}>
        <WordCloud words={words} options={options} />
    </div>
);

export default MyWordCloud;