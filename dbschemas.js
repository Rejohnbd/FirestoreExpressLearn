let db = {
    users: [
        {
            userId: 'SgRrteZPtrW3ccG7VUwyoRHMbLb2',
            email: 'user@email.com',
            handle: 'user',
            createdAt: '2019-08-13T09:01:34.945Z',
            imageUrl: 'image/dfjaldfad/afdsjflasd',
            bio: 'Hello, my name is user, nice to meet you',
            website: 'https://user.com',
            location: 'Dhaka, Bangladesh'
        }
    ],
    screams: [
        {
            userHandle: 'user',
            body: 'this is the scream boyd',
            createdAt: '2019-08-12T11:36:18.710Z',
            likeCount: 5,
            commentCount: 3
        }
    ],
    comments: [
        {
            userHandle: 'user',
            screamId: 'cxlvhhFYomuv4yM5pYRU',
            body: 'nice one mate!',
            createdAt: '2019-08-12T11:36:18.710Z'
        }
    ],
    notifications: [
        {
            recipient: 'user',
            sender: 'john',
            read: 'true | false',
            scramId: 'djafldkfjasdlf',
            type: 'like | comment',
            createdAt: '2019-08-12T11:36:18.710Z'
        }
    ]
};

const userDetails = {
    //Redux
    credentials: {
        userId: 'SgRrteZPtrW3ccG7VUwyoRHMbLb2',
        email: 'user@email.com',
        handle: 'user',
        createdAt: '2019-08-13T09:01:34.945Z',
        imageUrl: 'image/dfjaldfad/afdsjflasd',
        bio: 'Hello, my name is user, nice to meet you',
        website: 'https://user.com',
        location: 'Dhaka, Bangladesh'
    },
    likes: [
        {
            userHandle: 'user',
            screamId: 'cxlvhhFYomuv4yM5pYRU'
        },
        {

        }
    ]
};