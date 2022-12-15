import { useEffect, useState } from "react";
import Head from "next/head";
import { GetServerSideProps } from "next";
import { UseApi } from "../../libs/useApi";
import { Tenant } from "../../types/Tenant";
import { useAppContext } from "../../contexts/app";
import styles from '../../styles/Checkout.module.css'
import { getCookie, setCookie } from "cookies-next";
import { User } from "../../types/User";
import { useAuthContext } from "../../contexts/auth";
import { Header } from "../../components/Header";
import { InputField } from "../../components/InputField";
import { Button } from "../../components/Button";
import { useFormatter } from "../../libs/useFormatter";
import { CartItem } from "../../types/CartItem";
import { useRouter } from "next/router";
import { CartProductItem } from "../../components/CartProductItem/Index";
import { CartCookie } from "../../types/CartCookie";
import {ButtonWithIcon} from "../../components/ButtonWithIcon";

const Checkout = (data: Props) =>{

    const {setToken, setUser} = useAuthContext()
    const {tenant, setTenant} = useAppContext()
    const formater = useFormatter()
    const router = useRouter()

    // product control
    const [cart, setCart] = useState<CartItem[]>(data.cart)

    const handleCartChange = (newCount: number, id: number) => {
        const tempCart: CartItem[] = [...cart]
        const cartIndex = tempCart.findIndex(item => item.product.id === id)

        if(newCount > 0){
            tempCart[cartIndex].qt = newCount
        } else {
            delete tempCart[cartIndex]
        }    
        
        let newCart: CartItem[] = tempCart.filter(item => item)
        setCart(newCart)

        //update cookies
        let cartCookie: CartCookie[] = []
        for(let i in newCart){
            cartCookie.push({
                id: newCart[i].product.id,
                qt: newCart[i].qt
            })
        }

        setCookie('cart', JSON.stringify(cartCookie))
    }

    //shipping
    const [shippingInput, setShippingInput] = useState('')
    const [shippingAddress, setShippingAddress] = useState('')
    const [shippingPrice, setShippingPrice] = useState(0)
    const [shippingTime, setShippingTime] = useState(0)

    const handleShippingCalc = () => {
        setShippingAddress('Rua Blá Blá Blá')
        setShippingPrice(9.5)
        setShippingTime(45)
    }

    //resume
    const [subTotal, setSubTotal] = useState(1)

    useEffect(()=>{
        let sub = 0
        for(let i in cart){
            sub += cart[i].product.price * cart[i].qt
        }
        setSubTotal(sub)
    }, [cart])

    useEffect(()=>{
        setTenant(data.tenant)
        setToken(data.token)
        if(data.user) setUser(data.user)
    }, [])

    const handleFinish = () => {
        router.push(`/${data.tenant.slug}/checkout`)
    }

    const handleChangeAddress = () =>{
        console.log('indo para tela de endereço ->')
    }

    return (
        <div className={styles.container}>
            <Head>
                <title>Chackout | {data.tenant.name} </title>
            </Head>

            <Header
                backHref={`/${data.tenant.slug}`}
                color={data.tenant.mainColor}
                title="Checkout"
            />

            <div className={styles.productquantity}>
                {cart.length} {cart.length === 1 ? 'Item' : 'Itens'}
            </div>

            <div className={styles.infoGroup}>

            <div className={styles.infoArea}>
                <div className={styles.infoTitle}>
                    Endereço
                </div>
                <div className={styles.infoBody}>
                    <ButtonWithIcon
                        color={data.tenant.mainColor}
                        leftIcon={"location"}
                        rightIcon={"rightArrow"}
                        value={"Rua Teste, 12374290374937493475934875984735897349857439823074203947"}
                        onClick={handleChangeAddress}
                    />
                </div>
            </div>

            <div className={styles.infoArea}>
                <div className={styles.infoTitle}>
                    Forma de Pagamento
                </div>
                <div className={styles.infoBody}>
                    <div className={styles.paymentType}>
                        <div className={styles.paymentBtn}>
                            <ButtonWithIcon
                               color={data.tenant.mainColor}
                               leftIcon="money"
                               value="Dinheiro"
                               onClick={()=>{}}
                               fill/>
                        </div>
                        <div className={styles.paymentBtn}>
                            <ButtonWithIcon
                                color={data.tenant.mainColor}
                                leftIcon="card"
                                value="Cartão"
                                onClick={()=>{}}/>
                        </div>
                    </div>
                </div>
            </div>

            <div className={styles.infoArea}>
                <div className={styles.infoTitle}>
                    Troco
                </div>
                <div className={styles.infoBody}>
                    <InputField
                        color={data.tenant.mainColor}
                        placeholder="Quanto você tem em dinheiro?"
                        value={""}
                        onChange={newValue => {}}/>
                </div>
            </div>

            <div className={styles.infoArea}>
                <div className={styles.infoTitle}>
                    Cupom de Desconto
                </div>
                <div className={styles.infoBody}>
                    <ButtonWithIcon
                        color={data.tenant.mainColor}
                        value="CUPOM10"
                        leftIcon="cupom"
                        rightIcon="checked"
                    />
                </div>
            </div>

            </div>


            <div className={styles.productList}>
                {cart.map((cartItem, index)=>(
                    <CartProductItem 
                        key={index}
                        color={data.tenant.mainColor}
                        quantity={cartItem.qt}
                        product={cartItem.product}
                        onChange={handleCartChange}    
                    />
                ))}
            </div>

            <div className={styles.shippingArea}>
                <div className={styles.shippingTitle}>Calcular frete e prazo</div>

                <div className={styles.shippingForm}>
                    <InputField
                        color={data.tenant.mainColor}
                        placeholder="Digite seu CEP"
                        value={shippingInput}
                        onChange={newValue => setShippingInput(newValue)}
                        />

                        <Button
                            color={data.tenant.mainColor}
                            label="OK"
                            onClick={handleShippingCalc}
                        />
                </div>

                {shippingTime > 0 &&
                    <div className={styles.shippingInfo}>
                    <div className={styles.shippingAddress}>{shippingAddress}</div>
                    <div className={styles.shippingTime}>
                        <div className={styles.shippingTimeText}>Receba em até {shippingTime} minutos</div>
                        <div
                            style={{color: data.tenant.mainColor}} 
                            className={styles.shippingPrice}
                        >
                            {formater.formatPrice(shippingPrice)}
                        </div>
                    </div>
                </div>}
            </div>

            <div className={styles.resumeArea}>
                <div className={styles.resumeItem}>
                    <div className={styles.resumeLeft}>Subtotal</div>
                    <div className={styles.resumeRight}>{formater.formatPrice(subTotal)}</div>
                </div>

                <div className={styles.resumeItem}>
                    <div className={styles.resumeLeft}>Frete</div>
                    <div className={styles.resumeRight}>{shippingPrice > 0 ? formater.formatPrice(shippingPrice) : '--'}</div>
                </div>

                <div className={styles.resumeLine}></div>

                <div className={styles.resumeItem}>
                    <div className={styles.resumeLeft}>Total</div>
                    <div 
                        className={styles.resumeRightBig}
                        style={{color:data.tenant.mainColor}}
                        >{shippingPrice > 0 ? formater.formatPrice(shippingPrice + subTotal) : '--'}</div>
                </div>

                <div className={styles.resumeBtn}>
                    <Button
                        color={data.tenant.mainColor}
                        label="Continuar"
                        onClick={handleFinish}
                        fill
                    />
                </div>
            </div>
        </div>
    )
}

export default Checkout

type Props = {
    tenant: Tenant,
    token: string,
    user: User | null,
    cart: CartItem[]
}

export const getServerSideProps: GetServerSideProps = async (context)=>{
    const {tenant: tenantSlug} = context.query
    const api = UseApi(tenantSlug as string)
    
    //get tenant
    const tenant = await api.getTenant()
    if(!tenant){
        return {
            redirect: {
                destination: '/',
                permanent: false
            }
        }
    }

    // get logged user
    const token = getCookie('token', context) ?? null
    const user = await api.authorizeToken(token as string)

    // get cart product
    const cartCookie = getCookie('cart', context)
    const cart = await api.getCartProducts(cartCookie as string)
    console.log('cart ->', cart)
    
    return {
        props:{
            tenant,
            user,
            token,
            cart
        }
    }
}
