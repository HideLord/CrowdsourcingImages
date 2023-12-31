import React, { createContext, useState } from "react";

export const State = {
    PENDING: 1,
    SENDING: 2,
    SUCCESS: 3,
    FAILURE: 4
};

export const DescriptionContext = createContext();

function getImage(url, state) {
    return {
        url,
        state,
        tooltip: url,
    }
}

export function DescriptionProvider({ children }) {
    const [images, setImages] = useState([
        getImage("https://external-content.duckduckgo.com/iu/?u=http%3A%2F%2Finspirationseek.com%2Fwp-content%2Fuploads%2F2016%2F02%2FCute-Dog-Photography.jpg&f=1&nofb=1&ipt=21337b6fe489600d6558ca583959aaf70f2211f3c6761d504dfa032fb8f3180a&ipo=images",State.PENDING),
        getImage("https://external-content.duckduckgo.com/iu/?u=https%3A%2F%2Ftse1.mm.bing.net%2Fth%3Fid%3DOIP.jFZQogcGSNncaVuPSgJ2cQHaFj%26pid%3DApi&f=1&ipt=2aa43ee4dabe2cdce21024eea4267ef308f138b9eea0be732c002563995c50ce&ipo=images",State.PENDING),
        getImage("https://external-content.duckduckgo.com/iu/?u=https%3A%2F%2Ftse1.mm.bing.net%2Fth%3Fid%3DOIP.94SsFbivh18YNKuiTEIkmAHaHa%26pid%3DApi&f=1&ipt=969a6cfdffc825af6dcb264416b94191a1325ec6300085739207749069793e41&ipo=images",State.PENDING),
        getImage("https://external-content.duckduckgo.com/iu/?u=https%3A%2F%2Ftse2.mm.bing.net%2Fth%3Fid%3DOIP.z86nurg5VEy9ULrYNyQu0wHaE5%26pid%3DApi&f=1&ipt=cdd5b89d0c99d43d014fb312b32eadf365f3149b2a0144e56e2f5b89d4fc0e39&ipo=images",State.PENDING),
        getImage("https://external-content.duckduckgo.com/iu/?u=http%3A%2F%2Fpublicdomainpictures.net%2Fpictures%2F70000%2Fvelka%2Fdog-138615176618x.jpg&f=1&nofb=1&ipt=cebf5e5d6043cff3173f2948634f7dc237eaa3470e3a67b6bc4b2a903d62b4b2&ipo=images",State.PENDING),
        getImage("https://external-content.duckduckgo.com/iu/?u=https%3A%2F%2F1.bp.blogspot.com%2F-y-MyrWUZmSI%2FWKC1QrXAmzI%2FAAAAAAABuWk%2FF_DfWeEox4koyd50eoJeEM8EgMIRXX_AQCLcB%2Fs1600%2Fcute-dogs-164-28.jpg&f=1&nofb=1&ipt=654e782d24d9696b9a8f0423f2ead3a0c356c2b755bb5a5c92f626faa01dfdc5&ipo=images",State.PENDING),
        getImage("https://external-content.duckduckgo.com/iu/?u=https%3A%2F%2Fimage-album.com%2Fwp-content%2Fuploads%2F2016%2F08%2Fcropped-dogs-38.jpg&f=1&nofb=1&ipt=fed97eeb097d0ee84b6649df57f69d03be02d550d8a1bf35775ffa25f58cebf2&ipo=images",State.PENDING),
        getImage("https://external-content.duckduckgo.com/iu/?u=https%3A%2F%2Fwww.newshub.co.nz%2Fhome%2Flifestyle%2F2019%2F11%2Fdog-years-are-a-myth-2-year-old-dogs-already-middle-aged-scientists%2F_jcr_content%2Fpar%2Fvideo%2Fimage.dynimg.1280.q75.jpg%2Fv1574572358818%2FGETTY-labrador-puppy-1120.jpg&f=1&nofb=1&ipt=ef9f99bff28301f934a30e7f67a57a6f1d40e2e82e46e6008199d6ad8900ec69&ipo=images",State.PENDING),
        getImage("https://external-content.duckduckgo.com/iu/?u=https%3A%2F%2Fimages.unsplash.com%2Fphoto-1529429617124-95b109e86bb8%3Fixlib%3Drb-0.3.5%26q%3D80%26fm%3Djpg%26crop%3Dentropy%26cs%3Dtinysrgb%26w%3D1080%26fit%3Dmax%26ixid%3DeyJhcHBfaWQiOjEyMDd9%26s%3D4be6f29d095bc56cb800cc08ea6b3480&f=1&nofb=1&ipt=46424784eb988e0cd50d7dade8d621323a2df4f57c90401b60e638741a4bacaa&ipo=images",State.PENDING),
        getImage("https://external-content.duckduckgo.com/iu/?u=http%3A%2F%2Ffullhdwall.com%2Fwp-content%2Fuploads%2F2017%2F12%2FCute-Dog-Image.jpg&f=1&nofb=1&ipt=2568961cb2ab84d4975a57bfd06f6d8a9b066bda7952b21501aa2186670fe0f2&ipo=images",State.PENDING),
        getImage("https://external-content.duckduckgo.com/iu/?u=https%3A%2F%2Flh6.ggpht.com%2FEoH-UNwa_XRNuk0jB7UQDVQdTSigPu4B5zrb3I5iXk289KYfGZOzJgfwP8Y9DEA1O_k%3Dh900&f=1&nofb=1&ipt=6ced1c62ca7dfb47eeebb6ada1bde10d7d12e9cc22af5115a41074d1510d8319&ipo=images",State.PENDING),
        getImage("https://external-content.duckduckgo.com/iu/?u=https%3A%2F%2Fimages.pexels.com%2Fphotos%2F1108099%2Fpexels-photo-1108099.jpeg%3Fcs%3Dsrgb%26dl%3Dadorable-animal-breed-1108099.jpg%26fm%3Djpg&f=1&nofb=1&ipt=741d06997fe1aa020d24dca7255e5409b27db938f34d13fde6bf7601f81e312a&ipo=images",State.PENDING),
        getImage("https://external-content.duckduckgo.com/iu/?u=http%3A%2F%2Fimages6.fanpop.com%2Fimage%2Fphotos%2F35200000%2FDog-dogs-35247719-3706-2480.jpg&f=1&nofb=1&ipt=885934226f08429e0a7b44ad23f9070018dc05ae326e0c50ee1babf6b79cb124&ipo=images",State.PENDING),
        getImage("https://external-content.duckduckgo.com/iu/?u=https%3A%2F%2Fwww.nawpic.com%2Fmedia%2F2020%2Fcute-dog-nawpic-16-e1609618136426.jpg&f=1&nofb=1&ipt=9769483ca8c3a7c5089ae200f122d469ac363e5d22a8a0f30e7e242c68f9b72d&ipo=images",State.PENDING),
        getImage("https://external-content.duckduckgo.com/iu/?u=https%3A%2F%2Fpicjumbo.com%2Fwp-content%2Fuploads%2Fmaltese-dog-puppy-1570x1047.jpg&f=1&nofb=1&ipt=1dd619ac1ad0f0219ec7383a89cf4bd6bdfb58c3ecfc2ff252737161ed99ea33&ipo=images",State.PENDING),
        getImage("https://external-content.duckduckgo.com/iu/?u=https%3A%2F%2Fimages6.alphacoders.com%2F404%2Fthumb-1920-404483.jpg&f=1&nofb=1&ipt=b0940238ac4a9a38c95a5d7eb38ac9487a86aa8cf8e431614be7ec89def69e52&ipo=images",State.PENDING),
        getImage("https://external-content.duckduckgo.com/iu/?u=https%3A%2F%2Fwallpapercave.com%2Fwp%2Fqdp94oF.jpg&f=1&nofb=1&ipt=dbef037dba6fc5b7a8799b9a902ea494b408a6d869658f926c10f2e5f6e0eaa7&ipo=images",State.PENDING),
        getImage("https://external-content.duckduckgo.com/iu/?u=https%3A%2F%2F3.bp.blogspot.com%2F-V5V45SGn7fw%2FURIkFyNL9vI%2FAAAAAAAAZBA%2FIvX597VxPaE%2Fs1600%2Fwww.cwildlife.blogspot.com%2B(6).jpg&f=1&nofb=1&ipt=63e48670c5a7dfdd716dde7c86ee0994ced7325f9037b8d526753f8a63fc3dae&ipo=images",State.PENDING),
        getImage("https://external-content.duckduckgo.com/iu/?u=https%3A%2F%2Fwallpaperaccess.com%2Ffull%2F327871.jpg&f=1&nofb=1&ipt=1802a9b82d91c1b2d7014babce8fc5302594a8b59aa9dbf5eef1e7a7c0fc0d32&ipo=images",State.PENDING),
        getImage("https://external-content.duckduckgo.com/iu/?u=https%3A%2F%2Fglobaltravelsblog.com%2Fwp-content%2Fuploads%2F2014%2F05%2FSoutheastern-Guide-Dogs-Puppy.jpg&f=1&nofb=1&ipt=4a36e59967a9e4f2375fdc886f076d37f4b8053d7f7a77a22a3842aa34ec1132&ipo=images",State.PENDING),
        getImage("https://external-content.duckduckgo.com/iu/?u=http%3A%2F%2Fwww.pixelstalk.net%2Fwp-content%2Fuploads%2F2016%2F04%2FGolden-retriever-dogs-high-definition-wallpapers.jpg&f=1&nofb=1&ipt=3470400555631c862452a0fcb43101926d12b5c7d040d365bc4b2a07513277f3&ipo=images",State.PENDING),
    
    ]);
    const [numThreads, setNumThreads] = useState(8);
    const [currentPage, setCurrentPage] = useState(0);
    const [cashLimitThisSession, setCashLimitThisSession] = useState('');
    const [cashSpentThisSession, setCashSpentThisSession] = useState(0.00);
    const [numImages, setNumImages] = useState(images.length);

    const value = {
        images, setImages,
        numThreads, setNumThreads,
        currentPage, setCurrentPage,
        cashLimitThisSession, setCashLimitThisSession,
        cashSpentThisSession, setCashSpentThisSession,
        numImages, setNumImages,
    };

    return (
        <DescriptionContext.Provider value = {value}>
            {children}
        </DescriptionContext.Provider>
    );
}