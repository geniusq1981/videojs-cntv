var cntv = videojs.getTech('cntv');

describe('parseUrl', function() {
  it('should read the correct video ID', function() {
    expect(cntv.parseUrl('https://www.cntv.com/watch?v=OPf0YbXqDm0').videoId).toBe('OPf0YbXqDm0');
    expect(cntv.parseUrl('https://www.cntv.com/embed/OPf0YbXqDm0').videoId).toBe('OPf0YbXqDm0');
    expect(cntv.parseUrl('https://youtu.be/OPf0YbXqDm0').videoId).toBe('OPf0YbXqDm0');
  });

  it('should read the list in the URL', function() {
    var url = 'https://www.cntv.com/watch?v=RgKAFK5djSk&list=PL55713C70BA91BD6E';
    expect(cntv.parseUrl(url).listId).toBe('PL55713C70BA91BD6E');
  });
});
